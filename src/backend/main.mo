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

  type OnboardingAnswers = {
    year : Text;
    address : Text;
    city : Text;
    // Add more fields as needed
  };

  // ========= Chat Type Definitions =========

  public type Message = {
    id : Nat;
    sender : UserId;
    content : Text;
  };

  public type ChatConversation = {
    participants : (UserId, UserId); // (customer, listingOwner)
    messages : [Message];
    isOpen : Bool;
  };

  public type NewMessage = {
    sender : UserId;
    content : Text;
  };

  public type NewConversation = {
    participants : (UserId, UserId);
    message : NewMessage;
  };

  // ========= Internal State =========

  let adminEmailWhitelist = Set.empty<Text>();
  adminEmailWhitelist.add("aaryan123cse@gmail.com");
  adminEmailWhitelist.add("admin-balu@campusmarket.in");
  adminEmailWhitelist.add("pkamil13@gmail.com");

  var nextItemId = 0;
  var nextLostFoundItemId = 0;
  var nextMessageId = 0;

  let allItems = Map.empty<ItemId, ItemType>();
  let lostFoundItems = Map.empty<ItemId, LostFoundItem>();
  let userProfiles = Map.empty<UserId, UserProfile>();
  let onboardingAnswers = Map.empty<UserId, OnboardingAnswers>();

  let chatState = Map.empty<Text, ChatConversation>();

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

  func getNextMessageId() : Nat {
    let id = nextMessageId;
    nextMessageId += 1;
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

  func hasValidCampusMembership(caller : Principal) : Bool {
    if (AccessControl.isAdmin(accessControlState, caller)) {
      return true;
    };

    switch (userProfiles.get(caller)) {
      case (?profile) {
        validateUniversityEmail(profile.email) or isAdminEmail(profile.email);
      };
      case (null) { false };
    };
  };

  func getConversationId({ caller } : { caller : Principal }, participants : (UserId, UserId)) : Text {
    let (participant1, participant2) = if (caller.toText() < participants.1.toText()) {
      (caller, participants.1);
    } else {
      (participants.1, caller);
    };
    participant1.toText() # "|" # participant2.toText();
  };

  // ========== Chat Functions ==========

  public shared ({ caller }) func startConversation(newConversation : NewConversation) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can start conversations");
    };

    // Verify caller is one of the participants
    let (participant1, participant2) = newConversation.participants;
    if (caller != participant1 and caller != participant2) {
      Runtime.trap("Unauthorized: Can only start conversations you are part of");
    };

    // Verify sender matches caller
    if (newConversation.message.sender != caller) {
      Runtime.trap("Unauthorized: Cannot send messages as another user");
    };

    let conversationId = getConversationId({ caller }, newConversation.participants);
    let initialMessage : Message = {
      id = getNextMessageId();
      sender = caller; // Use caller instead of message.sender
      content = newConversation.message.content;
    };

    let newConversationData : ChatConversation = {
      participants = newConversation.participants;
      messages = [initialMessage];
      isOpen = true;
    };

    chatState.add(conversationId, newConversationData);
  };

  func isParticipant(authority : UserId, conversation : ChatConversation) : Bool {
    let (participant1, participant2) = conversation.participants;
    authority == participant1 or authority == participant2;
  };

  public shared ({ caller }) func sendMessage(conversationId : Text, message : NewMessage) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send messages");
    };

    // Verify sender matches caller
    if (message.sender != caller) {
      Runtime.trap("Unauthorized: Cannot send messages as another user");
    };

    switch (chatState.get(conversationId)) {
      case (?conversation) {
        if (not isParticipant(caller, conversation)) {
          Runtime.trap("Unauthorized: Can only interact with your own conversations");
        };

        let newMessage : Message = {
          id = getNextMessageId();
          sender = caller; // Use caller instead of message.sender
          content = message.content;
        };

        let updatedConversation : ChatConversation = {
          conversation with
          messages = conversation.messages.concat([newMessage]);
        };
        chatState.add(conversationId, updatedConversation);
      };
      case (null) { Runtime.trap("Conversation not found") };
    };
  };

  public query ({ caller }) func getMessages(conversationId : Text, offset : Nat, limit : Nat) : async [Message] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access messages");
    };

    switch (chatState.get(conversationId)) {
      case (?conversation) {
        if (not isParticipant(caller, conversation)) {
          Runtime.trap("Unauthorized: Can only access your own conversations");
        };
        if (offset >= conversation.messages.size()) {
          return [];
        };
        let end = Nat.min(offset + limit, conversation.messages.size());
        conversation.messages.sliceToArray(offset, end);
      };
      case (null) { Runtime.trap("Conversation not found") };
    };
  };

  public shared ({ caller }) func closeConversation(conversationId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can close conversations");
    };

    switch (chatState.get(conversationId)) {
      case (?conversation) {
        if (not isParticipant(caller, conversation)) {
          Runtime.trap("Unauthorized: Can only interact with your own conversations");
        };
        let updatedConversation : ChatConversation = {
          conversation with isOpen = false;
        };
        chatState.add(conversationId, updatedConversation);
      };
      case (null) { Runtime.trap("Conversation not found") };
    };
  };

  public shared ({ caller }) func reopenConversation(conversationId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can reopen conversations");
    };

    switch (chatState.get(conversationId)) {
      case (?conversation) {
        if (not isParticipant(caller, conversation)) {
          Runtime.trap("Unauthorized: Can only interact with your own conversations");
        };
        let updatedConversation : ChatConversation = {
          conversation with isOpen = true;
        };
        chatState.add(conversationId, updatedConversation);
      };
      case (null) { Runtime.trap("Conversation not found") };
    };
  };

  // ========== User Profile Functions ==========

  public query ({ caller }) func getUserProfile(user : UserId) : async ?UserProfile {
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

    userProfiles.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    if (not validateUniversityEmail(profile.email) and not isAdminEmail(profile.email)) {
      Runtime.trap("Unauthorized: Email must be from @jainuniversity.ac.in domain or admin email");
    };

    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func createUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create profiles");
    };

    if (not validateUniversityEmail(profile.email) and not isAdminEmail(profile.email)) {
      Runtime.trap("Unauthorized: Email must be from @jainuniversity.ac.in domain or admin email");
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
    onboardingAnswers.get(caller);
  };

  public query ({ caller }) func toMinimalItemList() : async [MinimalItem] {
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
    if (not hasValidCampusMembership(caller)) {
      Runtime.trap("Unauthorized: Valid university email required to view items");
    };

    lostFoundItems.values().toArray();
  };

  public query ({ caller }) func getLostFoundItem(itemId : ItemId) : async ?LostFoundItem {
    if (not hasValidCampusMembership(caller)) {
      Runtime.trap("Unauthorized: Valid university email required to view items");
    };

    lostFoundItems.get(itemId);
  };

  public shared ({ caller }) func postLostItem(title : Text, description : Text, location : Text, images : [Blob], storageBlobs : [Storage.ExternalBlob]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can post lost items");
    };

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
