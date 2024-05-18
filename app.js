const express = require('express');
const redis = require('redis');
const app = express();
const PORT = 3000;

const client = require('./redis')

// Middleware to cache responses
const cacheMiddleware = async (req, res, next) => {
    const cacheKey = req.originalUrl;
    client.get(cacheKey, (err, data) => {
        if (err) throw err;

        if (data !== null) {
            res.json(JSON.parse(data));
        } else {
            next();
        }
    });
};

// Common function for cache invalidation
const invalidateCache = (cacheKey) => {
    client.del(cacheKey, (err, response) => {
        if (err) throw err;
        console.log(`Cache key "${cacheKey}" invalidated`);
    });
};

app.get('/api/books', cacheMiddleware, async (req, res) => {
    // Implement your logic to fetch data from the API
    const response = await fetch('https://dummyjson.com/products');
    const products = await response.json();

    // Store the fetched data in Redis with a 2-minute expiry
    client.setex(req.originalUrl, 120, JSON.stringify(products));

    res.json(products);
});

// Example of cache invalidation when data changes (POST /api/books)
app.patch('/api/books/:id', async (req, res) => {
    /* updating title of product with id 1 */
    await fetch(`https://dummyjson.com/products/${req.params.id}`, {
        method: 'PUT', /* or PATCH */
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            title: 'iPhone Galaxy +1'
        })
    })


    // Invalidate the cache for the /api/books route
    invalidateCache('/api/books');

    res.json({ message: 'Book data updated successfully' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});