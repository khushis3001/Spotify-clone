const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

const Song = require("./models/Song");
const User = require("./models/User");
const authRoutes = require("./routes/auth");
console.log("AUTH ROUTES LOADED:", typeof authRoutes);
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

app.use("/api/auth", authRoutes);
// Serve audio files
app.use(
    "/songs",
    express.static(path.join(__dirname, "songs"))
);

// Test
app.get("/", (req, res) => {
    res.send("Spotify Backend is running!");
});
app.get("/hello", (req, res) => {
    console.log("HELLO ROUTE WAS CALLED");
    res.send("HELLO FROM MY CURRENT SERVER");
});
// Search songs
app.get("/api/search", async (req, res) => {

    try {

        const query = req.query.q;

        const songs = await Song.find({
            $or: [
                {
                    title: {
                        $regex: query,
                        $options: "i"
                    }
                },
                {
                    artist: {
                        $regex: query,
                        $options: "i"
                    }
                },
                {
                    album: {
                        $regex: query,
                        $options: "i"
                    }
                }
            ]
        });

        res.json(songs);

    } catch (error) {

        console.log("SEARCH ERROR:", error);

        res.status(500).json({
            message: error.message
        });

    }

});
// Get all songs
app.get("/api/songs", async (req, res) => {

    try {

        console.log("API /api/songs called");
        console.log("Song:", Song);
        console.log("Song.find:", typeof Song.find);

        const songs = await mongoose
            .model("Song")
            .find({});

        console.log("Songs found:", songs.length);

        res.json(songs);

    } catch (error) {

        console.log("SONG API ERROR:", error);

        res.status(500).json({
            message: error.message
        });

    }

});
app.get("/api/search", (req, res) => {
    console.log("SEARCH ROUTE WORKING");
    res.json({
        message: "Search route is working"
    });
});
app.post("/api/songs", async (req, res) => {

    try {

        const song = new Song(req.body);

        const savedSong = await song.save();

        res.status(201).json(savedSong);

    } catch (error) {

        console.log("ADD SONG ERROR:", error);

        res.status(500).json({
            message: error.message
        });

    }

});
// Search songs
app.get("/api/search", async (req, res) => {

    try {

        const query = req.query.q;

        const songs = await Song.find({
            $or: [
                {
                    title: {
                        $regex: query,
                        $options: "i"
                    }
                },
                {
                    artist: {
                        $regex: query,
                        $options: "i"
                    }
                },
                {
                    album: {
                        $regex: query,
                        $options: "i"
                    }
                }
            ]
        });

        res.json(songs);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});
// Get one song
app.get("/api/songs/:id", async (req, res) => {

    try {

        const song = await Song.findById(req.params.id);

        if (!song) {
            return res.status(404).json({
                message: "Song not found"
            });
        }

        res.json(song);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});
// Update a song
app.put("/api/songs/:id", async (req, res) => {

    try {

        const song = await Song.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!song) {
            return res.status(404).json({
                message: "Song not found"
            });
        }

        res.json(song);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});
// Delete a song
app.delete("/api/songs/:id", async (req, res) => {

    try {

        const song = await Song.findByIdAndDelete(req.params.id);

        if (!song) {
            return res.status(404).json({
                message: "Song not found"
            });
        }

        res.json({
            message: "Song deleted successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});
app.get("/test", (req, res) => {
    res.send("TEST ROUTE WORKING");
});

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected!");
    })
    .catch((error) => {
        console.log("MongoDB connection failed:", error.message);
    });

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
app.post("/api/register", async (req, res) => {

    try {

        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "Email already registered"
            });
        }

        const user = new User({
            name,
            email,
            password
        });

        await user.save();

        res.status(201).json({
            message: "User registered successfully",
            userId: user._id
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});
app.post("/api/login", async (req, res) => {

    try {

        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "User not found"
            });
        }

        if (user.password !== password) {
            return res.status(400).json({
                message: "Incorrect password"
            });
        }

        res.json({
            message: "Login successful",
            userId: user._id,
            name: user.name
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});
