CREATE TABLE orders (
    orderRowId SERIAL PRIMARY KEY,  -- Auto-incrementing unique row identifier
    orderId UUID UNIQUE NOT NULL,  -- Store GUID in PostgreSQL using UUID type
    company TEXT NOT NULL,
    eventType TEXT NOT NULL,
    accountId TEXT NOT NULL,
    customerName TEXT NOT NULL,
    email TEXT NOT NULL,
    total NUMERIC(10,2),
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    itemId SERIAL PRIMARY KEY,
    orderId UUID REFERENCES orders(orderId) ON DELETE CASCADE,  -- Reference GUID properly
    productId INT NOT NULL,
    name TEXT NOT NULL,
    quantity INT NOT NULL,
    price NUMERIC(10,2) NOT NULL
);

CREATE TABLE newsletter_subscriptions (
    subscriptionId SERIAL PRIMARY KEY,  -- Unique row identifier
    company TEXT NOT NULL,
    eventType TEXT NOT NULL,
    accountId TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,  -- Ensures email uniqueness
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);