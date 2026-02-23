// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract WYDAEscrow {
    address public immutable wydaToken;
    uint256 public listingCount;

    enum Status { Open, Locked, Completed, Refunded, Disputed }

    struct Listing {
        uint256 id;
        address payable seller;
        address payable buyer;
        uint256 price;
        Status status;
        string metadataUri; // IPFS or Backend ID
    }

    mapping(uint256 => Listing) public listings;

    event ListingCreated(uint256 indexed id, address indexed seller, uint256 price, string metadataUri);
    event ListingLocked(uint256 indexed id, address indexed buyer);
    event ListingCompleted(uint256 indexed id);
    event ListingRefunded(uint256 indexed id);

    constructor(address _wydaToken) {
        wydaToken = _wydaToken;
    }

    function createListing(uint256 _price, string memory _metadataUri) external {
        require(_price > 0, "Price must be greater than zero");
        listingCount++;
        listings[listingCount] = Listing({
            id: listingCount,
            seller: payable(msg.sender),
            buyer: payable(address(0)),
            price: _price,
            status: Status.Open,
            metadataUri: _metadataUri
        });
        emit ListingCreated(listingCount, msg.sender, _price, _metadataUri);
    }

    function buyItem(uint256 _id) external {
        Listing storage listing = listings[_id];
        require(listing.status == Status.Open, "Listing not open");
        require(msg.sender != listing.seller, "Seller cannot buy own item");

        listing.buyer = payable(msg.sender);
        listing.status = Status.Locked;

        require(IERC20(wydaToken).transferFrom(msg.sender, address(this), listing.price), "Token transfer failed");
        
        emit ListingLocked(_id, msg.sender);
    }

    function confirmReceipt(uint256 _id) external {
        Listing storage listing = listings[_id];
        require(listing.status == Status.Locked, "Listing not locked");
        require(msg.sender == listing.buyer, "Only buyer can confirm");

        listing.status = Status.Completed;
        require(IERC20(wydaToken).transfer(listing.seller, listing.price), "Token transfer to seller failed");

        emit ListingCompleted(_id);
    }

    function refundBuyer(uint256 _id) external {
        Listing storage listing = listings[_id];
        require(listing.status == Status.Locked, "Listing not locked");
        require(msg.sender == listing.seller, "Only seller can refund");

        listing.status = Status.Refunded;
        require(IERC20(wydaToken).transfer(listing.buyer, listing.price), "Token refund failed");

        emit ListingRefunded(_id);
    }
}
