'use strict';

const express = require('express');
const mongodb = require('mongodb');
const morgan = require('morgan');
const { makeSpan } = require("./tracing");

const PORT = process.env.PORT || 80;
const HOST = process.env.HOST || "0.0.0.0";
const DBHOST = process.env.DBHOST || "mongodb://localhost:27017";

function startServer(app) {
    return new Promise((resolve, reject) => {
        app.listen(PORT, HOST, err => {
            if (err) {
                reject(err);
            }
            else {
                console.log(`Running on http://${HOST}:${PORT}`);
                resolve();
            }
        });
    });
}

async function main() {

    const client = await mongodb.MongoClient.connect(DBHOST);
    const db = client.db("mydb");

    const app = express();

    if (process.env.NODE_ENV === "development") {
        morgan.token('req-headers', function (req, res) {
            return JSON.stringify(req.headers, null, 4);
        });

        app.use(morgan(':method :url :status :req-headers'));
    }

    app.get("/api/data", async (req, res) => {

        await makeSpan("my-database-request", async () => {
            const collection = db.collection("mycollection");
            const documents = await collection.find().toArray();
            res.json(documents);
        });
    });

    await startServer(app);
}

main()
    .then(() => console.log("Online"))
    .catch(err => {
        console.error("Failed to start!");
        console.error(err && err.stack || err);
    });
