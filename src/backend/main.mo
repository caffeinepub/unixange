import AccessControl "authorization/access-control";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Blob "mo:core/Blob";
import Iter "mo:core/Iter";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import Runtime "mo:core/Runtime";
import Char "mo:core/Char";

actor {
  // ========== Type Definitions ==========

  type UserId = Principal;
  type ItemId = Nat;
  type Rupee = Nat;

  public type ItemType = {
    #buySell : BuySellItem;
    #rental : RentalItem;
  };

  public type BuySellItem = {
    id : ItemId;
    title : Text;
    description : Text;
    price : Rupee;
    condition : Text;
    sellerId : UserId;
    images : [Blob];
    storageBlobs : [Storage.ExternalBlob];
    category : Text;
    isFromSellSection : Bool;
  };

  public type RentalItem = {
    id : ItemId;
    title : Text;
    description : Text;
    dailyPrice : Rupee;
    condition : Text;
    ownerId : UserId;
    available : Bool;
    images : [Blob];
    storageBlobs : [Storage.ExternalBlob];
    category : Text;
  };

  public type LostFoundItem = {
    id : ItemId;
    title : Text;
    description : Text;
    ownerId : UserId;
    status : Text;
    images : [Blob];
    storageBlobs : [Storage.ExternalBlob];
    location : Text;
  };

  public type UserProfile = {
    name : Text;
    email : Text;
    university : Text;
  };

  type MinimalItem = {
    id : ItemId;
    title : Text;
    price : ?Rupee;
    dailyPrice : ?Rupee;
    itemType : {
      #buySell;
      #rent;
      #lostFound;
    };
    image : Blob;
  };

  // ========== Actor State ==========

  var nextItemId = 0;
  var nextLostFoundItemId = 0;

  let allItems = Map.empty<ItemId, ItemType>();
  let lostFoundItems = Map.empty<ItemId, LostFoundItem>();
  let userProfiles = Map.empty<UserId, UserProfile>();

  include MixinStorage();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // ========== Helper Functions ==========

  func getNextItemId() : ItemId {
    let id = nextItemId;
    nextItemId += 1;
    id;
  };

  func getNextLostFoundItemId() : ItemId {
    let id = nextLostFoundItemId;
    nextLostFoundItemId += 1;
    id;
  };

  func toLowerCase(text : Text) : Text {
    let chars = text.toArray().map(
      func(c) {
        if (c >= 'A' and c <= 'Z') {
          Char.fromNat32(c.toNat32() + 32);
        } else {
          c;
        };
      }
    );
    Text.fromArray(chars);
  };

  func validateUniversityEmail(email : Text) : Bool {
    toLowerCase(email).endsWith(#text "@jainuniversity.ac.in");
  };

  func hasValidCampusMembership(caller : Principal) : Bool {
    // Admins bypass campus membership check
    if (AccessControl.isAdmin(accessControlState, caller)) {
      return true;
    };

    // Check if user has a profile with valid university email
    switch (userProfiles.get(caller)) {
      case (?profile) {
        validateUniversityEmail(profile.email);
      };
      case (null) {
        false;
      };
    };
  };

  // ========== User Profile Functions ==========

  public query ({ caller }) func getUserProfile(user : UserId) : async ?UserProfile {
    // Enforce campus membership check before allowing profile access
    if (not hasValidCampusMembership(caller)) {
      Runtime.trap("Unauthorized: Valid university email required to access profiles");
    };

    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };

    // Note: This function is allowed without campus membership check
    // because users need to retrieve their profile (if exists) to know
    // whether they need to create one with valid email
    userProfiles.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    // Validate university email domain (case-insensitive)
    if (not validateUniversityEmail(profile.email)) {
      Runtime.trap("Unauthorized: Email must be from @jainuniversity.ac.in domain");
    };

    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func createUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create profiles");
    };

    // Validate university email domain (case-insensitive)
    if (not validateUniversityEmail(profile.email)) {
      Runtime.trap("Unauthorized: Email must be from @jainuniversity.ac.in domain");
    };

    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func toMinimalItemList() : async [MinimalItem] {
    // Require valid campus membership to view items
    if (not hasValidCampusMembership(caller)) {
      Runtime.trap("Unauthorized: Valid university email required to view items");
    };

    allItems.toArray().map(
      func((_, item)) {
        switch (item) {
          case (#buySell(buySellItem)) {
            {
              id = buySellItem.id;
              title = buySellItem.title;
              price = ?buySellItem.price;
              dailyPrice = null;
              itemType = #buySell;
              image = if (buySellItem.images.size() > 0) { buySellItem.images[0] } else {
                Blob.fromArray([255]);
              };
            };
          };
          case (#rental(rentalItem)) {
            {
              id = rentalItem.id;
              title = rentalItem.title;
              price = null;
              dailyPrice = ?rentalItem.dailyPrice;
              itemType = #rent;
              image = if (rentalItem.images.size() > 0) {
                rentalItem.images[0];
              } else {
                Blob.fromArray([255]);
              };
            };
          };
        };
      }
    );
  };

  // ========== Buy/Sell Section Functions ==========

  public query ({ caller }) func getBuySellItems() : async [BuySellItem] {
    // Require valid campus membership to view items
    if (not hasValidCampusMembership(caller)) {
      Runtime.trap("Unauthorized: Valid university email required to view items");
    };

    allItems.toArray().filter(
      func((_, item)) {
        switch (item) {
          case (#buySell(_)) { true };
          case (#rental(_)) { false };
        };
      }
    ).map(func((_, item)) { switch (item) { case (#buySell(buySellItem)) { buySellItem }; case (#rental(_)) { Runtime.trap("Invalid type") } } });
  };

  public query ({ caller }) func getBuySellItem(itemId : ItemId) : async ?BuySellItem {
    // Require valid campus membership to view items
    if (not hasValidCampusMembership(caller)) {
      Runtime.trap("Unauthorized: Valid university email required to view items");
    };

    switch (allItems.get(itemId)) {
      case (?item) { switch (item) { case (#buySell(buySellItem)) { ?buySellItem }; case (#rental(_)) { null } } };
      case (null) { null };
    };
  };

  public shared ({ caller }) func addBuySellItem(title : Text, description : Text, price : Rupee, condition : Text, category : Text, images : [Blob], storageBlobs : [Storage.ExternalBlob], isFromSellSection : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can post items for sale");
    };

    // Require valid campus membership to post items
    if (not hasValidCampusMembership(caller)) {
      Runtime.trap("Unauthorized: Valid university email required to post items");
    };

    let id = getNextItemId();
    let buySellItem : BuySellItem = {
      id;
      title;
      description;
      price;
      condition;
      sellerId = caller;
      images;
      storageBlobs;
      category;
      isFromSellSection;
    };

    allItems.add(id, #buySell(buySellItem));
  };

  public query ({ caller }) func filterBuySellItemsByCategory(category : Text) : async [BuySellItem] {
    // Require valid campus membership to view items
    if (not hasValidCampusMembership(caller)) {
      Runtime.trap("Unauthorized: Valid university email required to view items");
    };

    allItems.toArray().filter(
      func((_, item)) {
        switch (item) {
          case (#buySell(buySellItem)) { Text.equal(buySellItem.category, category) };
          case (#rental(_)) { false };
        };
      }
    ).map(func((_, item)) { switch (item) { case (#buySell(buySellItem)) { buySellItem }; case (#rental(_)) { Runtime.trap("Invalid type") } } });
  };

  public query ({ caller }) func filterBuySellItemsByPriceRange(minPrice : Rupee, maxPrice : Rupee) : async [BuySellItem] {
    // Require valid campus membership to view items
    if (not hasValidCampusMembership(caller)) {
      Runtime.trap("Unauthorized: Valid university email required to view items");
    };

    allItems.toArray().filter(
      func((_, item)) {
        switch (item) {
          case (#buySell(buySellItem)) { buySellItem.price >= minPrice and buySellItem.price <= maxPrice };
          case (#rental(_)) { false };
        };
      }
    ).map(func((_, item)) { switch (item) { case (#buySell(buySellItem)) { buySellItem }; case (#rental(_)) { Runtime.trap("Invalid type") } } });
  };

  // ========== Rent Section Functions ==========

  public query ({ caller }) func getRentalItems() : async [RentalItem] {
    // Require valid campus membership to view items
    if (not hasValidCampusMembership(caller)) {
      Runtime.trap("Unauthorized: Valid university email required to view items");
    };

    allItems.toArray().filter(
      func((_, item)) {
        switch (item) { case (#rental(_)) { true }; case (#buySell(_)) { false } };
      }
    ).map(func((_, item)) { switch (item) { case (#rental(rentalItem)) { rentalItem }; case (#buySell(_)) { Runtime.trap("Invalid type") } } });
  };

  public query ({ caller }) func getRentalItem(itemId : ItemId) : async ?RentalItem {
    // Require valid campus membership to view items
    if (not hasValidCampusMembership(caller)) {
      Runtime.trap("Unauthorized: Valid university email required to view items");
    };

    switch (allItems.get(itemId)) {
      case (?item) { switch (item) { case (#rental(rentalItem)) { ?rentalItem }; case (#buySell(_)) { null } } };
      case (null) { null };
    };
  };

  public shared ({ caller }) func listForRent(title : Text, description : Text, dailyPrice : Rupee, condition : Text, category : Text, images : [Blob], storageBlobs : [Storage.ExternalBlob]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list items for rent");
    };

    // Require valid campus membership to post items
    if (not hasValidCampusMembership(caller)) {
      Runtime.trap("Unauthorized: Valid university email required to list items");
    };

    let id = getNextItemId();
    let rentalItem : RentalItem = {
      id;
      title;
      description;
      dailyPrice;
      condition;
      ownerId = caller;
      available = true;
      images;
      storageBlobs;
      category;
    };

    allItems.add(id, #rental(rentalItem));
  };

  // ========== Lost & Found Section Functions ==========

  public query ({ caller }) func getLostFoundItems() : async [LostFoundItem] {
    // Require valid campus membership to view items
    if (not hasValidCampusMembership(caller)) {
      Runtime.trap("Unauthorized: Valid university email required to view items");
    };

    lostFoundItems.values().toArray();
  };

  public query ({ caller }) func getLostFoundItem(itemId : ItemId) : async ?LostFoundItem {
    // Require valid campus membership to view items
    if (not hasValidCampusMembership(caller)) {
      Runtime.trap("Unauthorized: Valid university email required to view items");
    };

    lostFoundItems.get(itemId);
  };

  public shared ({ caller }) func postLostItem(title : Text, description : Text, location : Text, images : [Blob], storageBlobs : [Storage.ExternalBlob]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can post lost items");
    };

    // Require valid campus membership to post items
    if (not hasValidCampusMembership(caller)) {
      Runtime.trap("Unauthorized: Valid university email required to post items");
    };

    let id = getNextLostFoundItemId();
    let lostItem : LostFoundItem = {
      id;
      title;
      description;
      ownerId = caller;
      status = "lost";
      images;
      storageBlobs;
      location;
    };

    lostFoundItems.add(id, lostItem);
  };

  public shared ({ caller }) func postFoundItem(title : Text, description : Text, location : Text, images : [Blob], storageBlobs : [Storage.ExternalBlob]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can post found items");
    };

    // Require valid campus membership to post items
    if (not hasValidCampusMembership(caller)) {
      Runtime.trap("Unauthorized: Valid university email required to post items");
    };

    let id = getNextLostFoundItemId();
    let foundItem : LostFoundItem = {
      id;
      title;
      description;
      ownerId = caller;
      status = "found";
      images;
      storageBlobs;
      location;
    };

    lostFoundItems.add(id, foundItem);
  };

  // ========== Delete Item Functions ==========

  public shared ({ caller }) func deleteItem(itemId : ItemId) : async () {
    // Require valid campus membership for delete operations
    if (not hasValidCampusMembership(caller)) {
      Runtime.trap("Unauthorized: Valid university email required to delete items");
    };

    switch (allItems.get(itemId)) {
      case (?item) {
        var isOwner = false;
        switch (item) {
          case (#buySell(buySellItem)) { isOwner := buySellItem.sellerId == caller };
          case (#rental(rentalItem)) { isOwner := rentalItem.ownerId == caller };
        };

        if (not isOwner and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the item owner or admin can delete this item");
        };

        allItems.remove(itemId);
      };
      case (null) { Runtime.trap("Item not found in both buy/sell and rental sections") };
    };
  };

  public shared ({ caller }) func deleteLostFoundItem(itemId : ItemId) : async () {
    // Require valid campus membership for delete operations
    if (not hasValidCampusMembership(caller)) {
      Runtime.trap("Unauthorized: Valid university email required to delete items");
    };

    switch (lostFoundItems.get(itemId)) {
      case (?item) {
        if (item.ownerId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the item owner or admin can delete this item");
        };
        lostFoundItems.remove(itemId);
      };
      case (null) { Runtime.trap("Item not found in lost & found section") };
    };
  };

  // ========== Mark Item as Recovered ==========

  public shared ({ caller }) func markAsRecovered(itemId : ItemId) : async () {
    // Require valid campus membership for recovery operations
    if (not hasValidCampusMembership(caller)) {
      Runtime.trap("Unauthorized: Valid university email required to mark items as recovered");
    };

    switch (lostFoundItems.get(itemId)) {
      case (?item) {
        if (item.ownerId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the item owner or admin can mark as recovered");
        };
        let updatedItem : LostFoundItem = {
          item with status = "recovered";
        };
        lostFoundItems.add(itemId, updatedItem);
      };
      case (null) { Runtime.trap("Item not found") };
    };
  };

  // ========== Floating Add Button Functionality ==========

  public shared ({ caller }) func addItem(
    section : {
      #buySell;
      #rent;
      #lost;
      #found;
    },
    title : Text,
    description : Text,
    price : ?Rupee,
    dailyPrice : ?Rupee,
    condition : ?Text,
    category : ?Text,
    location : ?Text,
    images : [Blob],
    storageBlobs : [Storage.ExternalBlob],
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add items");
    };

    // Require valid campus membership to add items
    if (not hasValidCampusMembership(caller)) {
      Runtime.trap("Unauthorized: Valid university email required to add items");
    };

    switch (section) {
      case (#buySell) {
        await addBuySellItem(
          title,
          description,
          switch (price) { case (?p) { p }; case (null) { Runtime.trap("Price is required for buySell section") } },
          switch (condition) { case (?c) { c }; case (null) { Runtime.trap("Condition is required for buySell section") } },
          switch (category) { case (?cat) { cat }; case (null) { Runtime.trap("Category is required for buySell section") } },
          images,
          storageBlobs,
          true,
        );
      };
      case (#rent) {
        await listForRent(
          title,
          description,
          switch (dailyPrice) { case (?dp) { dp }; case (null) { Runtime.trap("Daily price is required for rent section") } },
          switch (condition) { case (?c) { c }; case (null) { Runtime.trap("Condition is required for rent section") } },
          switch (category) { case (?cat) { cat }; case (null) { Runtime.trap("Category is required for rent section") } },
          images,
          storageBlobs,
        );
      };
      case (#lost) {
        await postLostItem(
          title,
          description,
          switch (location) { case (?loc) { loc }; case (null) { Runtime.trap("Location is required for lost section") } },
          images,
          storageBlobs,
        );
      };
      case (#found) {
        await postFoundItem(
          title,
          description,
          switch (location) { case (?loc) { loc }; case (null) { Runtime.trap("Location is required for found section") } },
          images,
          storageBlobs,
        );
      };
    };
  };
};
