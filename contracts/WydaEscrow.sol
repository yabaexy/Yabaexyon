// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @dev Interface of the ERC20 standard as defined in the EIP.
 */
interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

/**
 * @title WydaEscrow
 * @dev A secure escrow contract for the WYDA DApp on BSC.
 */
contract WydaEscrow {
    address public immutable wydaToken;
    address public owner;

    enum ListingStatus { Open, Locked, Completed, Refunded }
    enum PricingType { Fixed, Auction }

    struct Listing {
        uint256 id;
        address seller;
        address buyer;
        uint256 price;
        uint256 minPrice;
        ListingStatus status;
        PricingType pricingType;
        string metadataUri;
    }

    uint256 public listingCount;
    mapping(uint256 => Listing) public listings;

    event ListingCreated(uint256 indexed id, address indexed seller, uint256 price, uint256 minPrice, PricingType pricingType, string metadataUri);
    event ListingLocked(uint256 indexed id, address indexed buyer);
    event ListingCompleted(uint256 indexed id);
    event ListingRefunded(uint256 indexed id);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        wydaToken = 0xD84B7E8b295d9Fa9656527AC33Bf4F683aE7d2C4;
        owner = msg.sender;
    }

    /**
     * @dev Seller creates a listing.
     */
    function createListing(
        uint256 _price,
        uint256 _minPrice,
        PricingType _pricingType,
        string memory _metadataUri
    ) external {
        require(_price > 0, "Price must be > 0");
        
        listingCount++;
        listings[listingCount] = Listing({
            id: listingCount,
            seller: msg.sender,
            buyer: address(0),
            price: _price,
            minPrice: _minPrice,
            status: ListingStatus.Open,
            pricingType: _pricingType,
            metadataUri: _metadataUri
        });

        emit ListingCreated(listingCount, msg.sender, _price, _minPrice, _pricingType, _metadataUri);
    }

    /**
     * @dev Buyer deposits WYDA tokens to lock the item in escrow.
     */
    function buyItem(uint256 _id) external {
        Listing storage listing = listings[_id];
        require(listing.status == ListingStatus.Open, "Not open");
        require(listing.seller != msg.sender, "Seller cannot buy");

        listing.status = ListingStatus.Locked;
        listing.buyer = msg.sender;

        // Transfer tokens from buyer to this contract
        require(
            IERC20(wydaToken).transferFrom(msg.sender, address(this), listing.price),
            "Transfer failed"
        );

        emit ListingLocked(_id, msg.sender);
    }

    /**
     * @dev Buyer confirms receipt, releasing funds to the seller.
     */
    function confirmReceipt(uint256 _id) external {
        Listing storage listing = listings[_id];
        require(listing.status == ListingStatus.Locked, "Not locked");
        require(msg.sender == listing.buyer, "Only buyer can confirm");

        listing.status = ListingStatus.Completed;

        // Release funds to seller
        require(
            IERC20(wydaToken).transfer(listing.seller, listing.price),
            "Transfer failed"
        );

        emit ListingCompleted(_id);
    }

    /**
     * @dev Seller or Admin refunds the buyer if the trade is canceled.
     */
    function refundBuyer(uint256 _id) external {
        Listing storage listing = listings[_id];
        require(listing.status == ListingStatus.Locked, "Not locked");
        require(msg.sender == listing.seller || msg.sender == owner, "Unauthorized");

        listing.status = ListingStatus.Refunded;

        // Return funds to buyer
        require(
            IERC20(wydaToken).transfer(listing.buyer, listing.price),
            "Transfer failed"
        );

        emit ListingRefunded(_id);
    }

    /**
     * @dev Emergency withdrawal for the owner (e.g., if tokens are sent by mistake).
     */
    function withdrawTokens(address _token, uint256 _amount) external onlyOwner {
        IERC20(_token).transfer(owner, _amount);
    }

    /**
     * @dev Change contract owner.
     */
    function transferOwnership(address _newOwner) external onlyOwner {
        owner = _newOwner;
    }
}
