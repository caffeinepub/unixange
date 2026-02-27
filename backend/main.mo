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
import Set "mo:core/Set";
import Migration "migration";

(with migration = Migration.run)
actor {
  // ========== Type Definitions ==========

  type UserId = Principal;
  type ItemId = Nat;
  type Rupee = Nat;
  type NonUniversityPrincipal = Principal;

  public type Error = {
    #nonUniversityPrincipal : NonUniversityPrincipal;
    #backend : Text;
    #forbidden;
    #ledger;
    #nonExistent;
    #notAuthorized;
    #notYetSupported;
    #stableVarInvariant;
  };

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
    whatsappNumber : Text; // Added field
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
    whatsappNumber : Text; // Added field
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

  type OnboardingAnswers = {
    year : Text;
    address : Text;
    city : Text;
  };

  // ========= Initialization =========

  let adminEmailWhitelist = Set.empty<Text>();
  adminEmailWhitelist.add("aaryan123cse@gmail.com");
  adminEmailWhitelist.add("admin-balu@campusmarket.in");
  adminEmailWhitelist.add("pkamil13@gmail.com");

  // ========== Actor State ==========

  var nextItemId = 0;
  var nextLostFoundItemId = 0;

  let allItems = Map.empty<ItemId, ItemType>();
  let lostFoundItems = Map.empty<ItemId, LostFoundItem>();
  let userProfiles = Map.empty<UserId, UserProfile>();
  let onboardingAnswers = Map.empty<UserId, OnboardingAnswers>();

  let nonUniversityPrincipals = Map.empty<Principal, ()>();

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

  func isAdminEmail(email : Text) : Bool {
    adminEmailWhitelist.contains(email);
  };

  // Returns true if the caller is allowed to create/modify profiles and items.
  // Admins always pass. Otherwise the caller must have a saved profile whose
  // email belongs to @jainuniversity.ac.in or the admin whitelist.
  func hasValidCampusMembership(caller : Principal) : Bool {
    if (AccessControl.isAdmin(accessControlState, caller)) {
      return true;
    };
    // Also allow if the principal is not in the explicit blocklist
    if (nonUniversityPrincipals.containsKey(caller)) {
      return false;
    };
    switch (userProfiles.get(caller)) {
      case (?profile) {
        validateUniversityEmail(profile.email) or isAdminEmail(profile.email);
      };
      case (null) {
        false;
      };
    };
  };

  // ========== "Campus Membership" Functions ==========

  public shared ({ caller }) func isCampusMember() : async Bool {
    hasValidCampusMembership(caller);
  };

  public shared ({ caller }) func isNonUniversityPrincipal(principal : Principal) : async Bool {
    if (nonUniversityPrincipals.containsKey(principal)) { return true };
    switch (userProfiles.get(principal)) {
      case (?profile) {
        return not (validateUniversityEmail(profile.email) or isAdminEmail(profile.email));
      };
      case (null) { return false };
    };
  };

  // ========== Non-University Principal Management ==========

  public shared ({ caller }) func addNonUniversityPrincipal(principal : Principal) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can add non-university principals");
    };
    nonUniversityPrincipals.add(principal, ());
  };

  public shared ({ caller }) func removeNonUniversityPrincipal(principal : Principal) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can remove non-university principals");
    };
    nonUniversityPrincipals.remove(principal);
  };

  public query ({ caller }) func getNonUniversityPrincipals() : async [Principal] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can list non-university principals");
    };
    nonUniversityPrincipals.toArray().map(func((p, _)) { p });
  };

  // ========== User Profile Functions ==========

  public query ({ caller }) func getUserProfile(user : UserId) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    // Prevent non-university email usage
    if (not validateUniversityEmail(profile.email) and not isAdminEmail(profile.email)) {
      Runtime.trap("Unauthorized: Email must be from @jainuniversity.ac.in domain or admin email");
    };

    // Prevent explicitly blocked principals from saving profiles
    if (nonUniversityPrincipals.containsKey(caller)) {
      Runtime.trap("Unauthorized: This principal has been blocked from saving profiles");
    };

    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func createUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create profiles");
    };

    // Prevent non-university email usage
    if (not validateUniversityEmail(profile.email) and not isAdminEmail(profile.email)) {
      Runtime.trap("Unauthorized: Email must be from @jainuniversity.ac.in domain or admin email");
    };

    // Prevent explicitly blocked principals from creating profiles
    if (nonUniversityPrincipals.containsKey(caller)) {
      Runtime.trap("Unauthorized: This principal has been blocked from creating profiles");
    };

    userProfiles.add(caller, profile);
    onboardingAnswers.add(caller, {
      year = "";
      address = "";
      city = "";
    });
  };

  public shared ({ caller }) func setOnboardingAnswers(answers : OnboardingAnswers) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can set onboarding answers");
    };

    onboardingAnswers.add(caller, answers);
  };

  public query ({ caller }) func getOnboardingAnswers() : async ?OnboardingAnswers {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get onboarding answers");
    };
    onboardingAnswers.get(caller);
  };

  public query ({ caller }) func toMinimalItemList() : async [MinimalItem] {
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
    switch (allItems.get(itemId)) {
      case (?item) { switch (item) { case (#buySell(buySellItem)) { ?buySellItem }; case (#rental(_)) { null } } };
      case (null) { null };
    };
  };

  public shared ({ caller }) func addBuySellItem(title : Text, description : Text, price : Rupee, condition : Text, category : Text, images : [Blob], storageBlobs : [Storage.ExternalBlob], isFromSellSection : Bool, whatsappNumber : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can post items for sale");
    };

    // Only university members (or admins) may create items
    if (not hasValidCampusMembership(caller)) {
      Runtime.trap("Unauthorized: Only @jainuniversity.ac.in members can post items for sale");
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
      whatsappNumber;
    };

    allItems.add(id, #buySell(buySellItem));
  };

  public query ({ caller }) func filterBuySellItemsByCategory(category : Text) : async [BuySellItem] {
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
    allItems.toArray().filter(
      func((_, item)) {
        switch (item) { case (#rental(_)) { true }; case (#buySell(_)) { false } };
      }
    ).map(func((_, item)) { switch (item) { case (#rental(rentalItem)) { rentalItem }; case (#buySell(_)) { Runtime.trap("Invalid type") } } });
  };

  public query ({ caller }) func getRentalItem(itemId : ItemId) : async ?RentalItem {
    switch (allItems.get(itemId)) {
      case (?item) { switch (item) { case (#rental(rentalItem)) { ?rentalItem }; case (#buySell(_)) { null } } };
      case (null) { null };
    };
  };

  public shared ({ caller }) func listForRent(title : Text, description : Text, dailyPrice : Rupee, condition : Text, category : Text, images : [Blob], storageBlobs : [Storage.ExternalBlob], whatsappNumber : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list items for rent");
    };

    // Only university members (or admins) may list items
    if (not hasValidCampusMembership(caller)) {
      Runtime.trap("Unauthorized: Only @jainuniversity.ac.in members can list items for rent");
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
      whatsappNumber;
    };

    allItems.add(id, #rental(rentalItem));
  };

  // ========== Lost & Found Section Functions ==========

  public query ({ caller }) func getLostFoundItems() : async [LostFoundItem] {
    lostFoundItems.values().toArray();
  };

  public query ({ caller }) func getLostFoundItem(itemId : ItemId) : async ?LostFoundItem {
    lostFoundItems.get(itemId);
  };

  public shared ({ caller }) func postLostItem(title : Text, description : Text, location : Text, images : [Blob], storageBlobs : [Storage.ExternalBlob]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can post lost items");
    };

    // Only university members (or admins) may post lost items
    if (not hasValidCampusMembership(caller)) {
      Runtime.trap("Unauthorized: Only @jainuniversity.ac.in members can post lost items");
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

    // Only university members (or admins) may post found items
    if (not hasValidCampusMembership(caller)) {
      Runtime.trap("Unauthorized: Only @jainuniversity.ac.in members can post found items");
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete items");
    };

    // Only university members (or admins) may delete items
    if (not hasValidCampusMembership(caller)) {
      Runtime.trap("Unauthorized: Only @jainuniversity.ac.in members can delete items");
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete lost/found items");
    };

    // Only university members (or admins) may delete items
    if (not hasValidCampusMembership(caller)) {
      Runtime.trap("Unauthorized: Only @jainuniversity.ac.in members can delete lost/found items");
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark items as recovered");
    };

    // Only university members (or admins) may modify items
    if (not hasValidCampusMembership(caller)) {
      Runtime.trap("Unauthorized: Only @jainuniversity.ac.in members can mark items as recovered");
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
    whatsappNumber : ?Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add items");
    };

    // Only university members (or admins) may add items
    if (not hasValidCampusMembership(caller)) {
      Runtime.trap("Unauthorized: Only @jainuniversity.ac.in members can add items");
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
          switch (whatsappNumber) { case (?number) { number }; case (null) { Runtime.trap("Whatsapp number is required for buySell section") } },
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
          switch (whatsappNumber) { case (?number) { number }; case (null) { Runtime.trap("Whatsapp number is required for rent section") } },
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
