// client/src/components/main-view/main-view.jsx
import React from 'react';
import axios from 'axios';

//import view
import { LoginView } from '../login-view/login-view';
import { MovieCard } from '../movie-card/movie-card';
import { MovieView } from '../movie-view/movie-view';
import { RegistrationView } from '../registration-view/registration-view';

//react-bootstrap imports
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import './main-view.scss';

export class MainView extends React.Component {
    constructor() {
        super();

        this.state = {
            movies: null,
            selectedMovie: null,
            user: null,
            register: false,
        };
    }

    getMovies(token) {
        axios
            .get('https://movie-api0.herokuapp.com/', {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((response) => {
                // Assign the result to the state
                this.setState({
                    movies: response.data,
                });
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    componentDidMount() {
        let accessToken = localStorage.getItem('token');
        if (accessToken !== null) {
            this.setState({
                user: localStorage.getItem('user'),
            });
            this.getMovies(accessToken);
        }
    }

    onMovieClick(movie) {
        this.setState({
            selectedMovie: movie,
            // userAction: null,
        });
    }

    onLoggedIn(authData) {
        console.log(authData);
        this.setState({
            user: authData.user.Username,
        });

        localStorage.setItem('token', authData.token);
        localStorage.setItem('user', authData.user.Username);
        this.getMovies(authData.token);
    }

    // onLoggedIn(user) {
    //   this.setState({
    //     user,
    //     // userAction: null,
    //   });
    // }

    //button to return to all movies view
    onButtonClick() {
        this.setState({
            selectedMovie: null,
        });
    }

    //testing
    onSignedIn(user) {
        this.setState({
            user: user,
            register: false,
        });
    }

    register() {
        this.setState({ register: true });
    }

    render() {
        const { movies, selectedMovie, user, register } = this.state;

        if (!user && register === false)
            return (
                <LoginView
                    onClick={() => this.onRegistered()}
                    onLoggedIn={(user) => this.onLoggedIn(user)}
                />
            );

        if (register)
            return (
                <RegistrationView
                    onClick={() => this.alreadyMember()}
                    onSignedIn={(user) => this.onSignedIn(user)}
                />
            );

        //before the movies has been loaded
        if (!movies) return <div className="main-view" />;
        return (
            <div className="main-view">
                <Container>
                    <Row>
                        {selectedMovie ? (
                            <MovieView
                                movie={selectedMovie}
                                onClick={() => this.onButtonClick()}
                            />
                        ) : (
                                movies.map((movie) => (
                                    <Col key={movie._id} xs={12} sm={6} md={4}>
                                        <MovieCard
                                            key={movie._id}
                                            movie={movie}
                                            onClick={(movie) => this.onMovieClick(movie)}
                                        />
                                    </Col>
                                ))
                            )}
                    </Row>
                </Container>
            </div>
        );
    }
}