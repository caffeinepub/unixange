import Map "mo:core/Map";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Blob "mo:core/Blob";
import Storage "blob-storage/Storage";

module {
  // Replicating existing types for migration context
  type UserId = Principal;
  type ItemId = Nat;
  type Rupee = Nat;

  type BuySellItem = {
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

  type RentalItem = {
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

  type LostFoundItem = {
    id : ItemId;
    title : Text;
    description : Text;
    ownerId : UserId;
    status : Text;
    images : [Blob];
    storageBlobs : [Storage.ExternalBlob];
    location : Text;
  };

  type UserProfile = {
    name : Text;
    email : Text;
    university : Text;
  };

  type OnboardingAnswers = {
    year : Text;
    address : Text;
    city : Text;
  };

  type Message = {
    id : Nat;
    sender : UserId;
    content : Text;
  };

  type ChatConversation = {
    participants : (UserId, UserId);
    messages : [Message];
    isOpen : Bool;
  };

  // Old actor type without the new stable variable
  type OldActor = {
    nextItemId : Nat;
    nextLostFoundItemId : Nat;
    allItems : Map.Map<ItemId, { #buySell : BuySellItem; #rental : RentalItem }>;
    lostFoundItems : Map.Map<ItemId, LostFoundItem>;
    userProfiles : Map.Map<UserId, UserProfile>;
    onboardingAnswers : Map.Map<UserId, OnboardingAnswers>;
  };

  // New actor type with the new stable variable
  type NewActor = {
    nextItemId : Nat;
    nextLostFoundItemId : Nat;
    nextMessageId : Nat; // Variable does not exist yet, will be initialized in migration
    allItems : Map.Map<ItemId, { #buySell : BuySellItem; #rental : RentalItem }>;
    lostFoundItems : Map.Map<ItemId, LostFoundItem>;
    userProfiles : Map.Map<UserId, UserProfile>;
    onboardingAnswers : Map.Map<UserId, OnboardingAnswers>;
    chatState : Map.Map<Text, ChatConversation>;
  };

  public func run(old : OldActor) : NewActor {
    let emptyChatState = Map.empty<Text, ChatConversation>();
    { old with chatState = emptyChatState; nextMessageId = 0 }; // Initialize nextMessageId
  };
};
