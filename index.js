const express = require('express'),
  morgan = require('morgan'),
  bodyParser = require("body-parser"),
  uuid = require("uuid"),
  app = express();

// List of movies

let Movies = [
    {
        title : 'Superbad',
        description : 'Two co-dependent high school seniors are forced to deal \
        with separation anxiety after their plan to stage a booze-soaked party goes awry.',
        genre : 'Comedy',
        director : 'Greg Mottola',
        image : 'superbad.png'
    },
    {
        title : 'Iron Man',
        description : 'After being held captive in an Afghan cave, billionaire engineer \
        Tony Stark creates a unique weaponized suit of armor to fight evil.',
        genre : 'Action',
        director : 'Jon Favreau',
        image : 'iron_man.png'
    },
    {
        title : 'Pulp Fiction',
        description : 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair \
        of diner bandits intertwine in four tales of violence and redemption.',
        genre : 'Drama',
        director : 'Quentin Tarantino',
        image : 'pulp_fiction.png'
    },
    {
        title : 'Deadpool',
        description : 'A wisecracking mercenary gets experimented on and becomes immortal but \
        ugly, and sets out to track down the man who ruined his looks.',
        genre : 'Action',
        director : 'Tim Miller',
        image : 'deadpool.png'
    },
    {
        title : 'Memento',
        description : "A man with short-term memory loss attempts to track down his wife's \
        murderer.",
        genre : 'Thriller',
        director : 'Christopher Nolan',
        image : 'memento.png'
    }
]

// List of genres

let Genres = [
    {
        name : 'Comedy',
        description : 'A comedy film is a genre of film in which the main emphasis is on humour. \
        These films are designed to make the audience laugh through amusement and most often \
        work by exaggerating characteristics for humorous effect.'
    },
    {
        name : 'Action',
        description : 'Action film is a film genre in which the protagonist or protagonists \
        are thrust into a series of events that typically include violence, extended \
        fighting, physical feats, and frantic chases. Action films tend to feature a \
        resourceful hero struggling against incredible odds, which include \
        life-threatening situations, a villain, or a pursuit which usually concludes in \
        victory for the hero.'
    },
    {
        name : 'Drama',
        description : 'In film and television, drama is a genre of narrative fiction \
        (or semi-fiction) intended to be more serious than humorous in tone. All forms of \
        cinema or television that involve fictional stories are forms of drama in the \
        broader sense if their storytelling is achieved by means of actors who represent \
        (mimesis) characters.'
    },
    {
        name : 'Thriller',
        description : 'Thriller film, also known as suspense film or suspense thriller, is \
        a broad film genre that evokes excitement and suspense in the audience. Tension is \
        created by delaying what the audience sees as inevitable, and is built through \
        situations that are menacing or where escape seems impossible.'
    }
]

// List of directors

let Directors = [
    {
        name : 'Greg Mottola',
        born : 'July 11, 1964'
    },
    {
        name : 'Jon Favreau',
        born : 'October 19, 1966'
    },
    {
        name : 'Quentin Tarantino',
        born : 'March 27, 1963'
    },
    {
        name : 'Tim Miller',
        born : 'February 28, 1970'
    },
    {
        name : 'Christopher Nolan',
        born : 'July 30, 1970'
    }
]

// User info

let Users = [
    {
        id : 1,
        username : 'janedoe123',
        password : 'password123',
        email : 'example@gmail.com',
        date_of_birth : "January 1, 1990",
        Favorites : {

        }
    }
]

// List of Favorites

let Favorites = [
    {
        title : 'Iron Man',
        description : 'After being held captive in an Afghan cave, billionaire engineer \
        Tony Stark creates a unique weaponized suit of armor to fight evil.',
        genre : 'Action',
        director : 'Jon Favreau',
        image : 'iron_man.png'
    }
]

// Logging with Morgan

app.use(morgan('common'));

// Using bodyParser

app.use(bodyParser.json());

// Gets the list of data about ALL movies

app.get("/movies", function(req, res) {
    res.json(Movies)
});

// Gets the data about a single movie, by name

app.get("/movies/:title", (req, res) => {
    res.json(Movies.find((movie) => {
        return movie.title === req.params.title
    }));
});

// Get data about a movie genre, by name

app.get("/genres/:name", (req, res) => {
    res.json(Genres.find((genre) => {
        return genre.name === req.params.name
    }));
});

// Get data about a director

app.get("/directors/:name", (req, res) => {
    res.json(Directors.find((director) => {
        return director.name === req.params.name
    }));
});

// Add data for a new user

app.post("/users", (req, res) => {
    let newUser = req.body;

    if (!newUser.username || !newUser.password) {
        const message = "Missing username or password in request body";
        res.status(400).send(message);
    } else {
        newUser.id = uuid.v4();
        Users.push(newUser);
        res.status(201).send(newUser);
    }
});

// Update the user's information

app.put("/users/:username", (req, res) => {
    res.send("Successful User information updated");
})

// Add movies to user's list of favorites

app.post("/users/:username/favorites", (req, res) => {
    let newFavorite = req.body;

    if (!newFavorite.title) {
        const message = "Missing movie title in request body";
        res.status(400).send(message);
    } else {
        newFavorite.id = uuid.v4();
        Favorites.push(newFavorite);
        res.status(201).send(newFavorite);
    }
});

// Remove movies from user's list of favorites

app.delete("/users/:username/favorites/:title", (req, res) => {
    let favorite = Favorites.find((favorite) => {
        return favorite.title === req.params.title
    });
    if (favorite) {
        Favorites.filter(function(obj) {
            return obj.title !== req.params.title
        });
        res.status(201).send(req.params.title + " was removed from favorites.");
    }
});

// Deletes a user from list by ID

app.delete("/users/:username", (req, res) => {
    let user = Users.find((user) => {
        return user.username === req.params.username
    });
    if (user) {
        Users.filter(function(obj) {
            return obj.username !== req.params.username
        });
        res.status(201).send(req.params.username + " has been removed from registry .");
    }
});

app.use(express.static('public'));

app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Listen for requests on port 8080

app.listen(8080);
