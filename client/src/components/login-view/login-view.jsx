import React, { useState, useEffect } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Animated from "react-css-animated";

import axios from "axios";

export function LoginView(props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [validated, setValidated] = useState(false);
  const [loginFail, setloginFail] = useState(false);
  var mounted = true;

  const handleSubmit = (event) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    }
    setValidated(true);

    if (form.checkValidity() === true) {
      if (mounted) {
        event.preventDefault();
        axios
          .post("https://movie-api0.herokuapp.com/", {
            Username: username,
            Password: password,
          })
          .then((response) => {
            const data = response.data;
            props.onLoggedIn(data);
          })
          .catch((e) => {
            setValidated(false);
            setloginFail(true);
          });
      }
    }
  };

  useEffect(() => {
    return () => {
      mounted = false;
    };
  }, [mounted]);

  return (
    <Animated
      className="h-100"
      animateOnMount
      animationIn="fadeInLeft"
      duration={{ in: 600 }}
      animationOut="fadeOutRight"
      isVisible={props.animate}
    >
      <Col className="mt-5">
        <h1 className="text-center pt-3">Login</h1>
        <Form
          className="col mx-auto "
          noValidate
          validated={validated}
          onSubmit={handleSubmit}
        >
          <Form.Group controlId="validationCustom01">
            <Form.Label>Username</Form.Label>
            <Form.Control
              required
              isInvalid={loginFail}
              type="text"
              placeholder=""
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <Form.Control.Feedback type="invalid">
              {loginFail
                ? "Username/Password not found!"
                : "Please Enter a valid Username"}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group controlId="validationCustom02">
            <Form.Label>Password</Form.Label>
            <Form.Control
              required
              isInvalid={loginFail}
              type="password"
              placeholder=""
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Form.Control.Feedback type="invalid">
              {loginFail
                ? "Username/Password not found!"
                : "Please enter a valid Password"}
            </Form.Control.Feedback>
            <Button
              variant="link"
              onClick={() => props.linkTo("/register", 700, false)}
            >
              Dont have an account? Click here to register!
            </Button>
          </Form.Group>

          <Button type="submit" className="d-block mx-auto">
            Submit
          </Button>
        </Form>
      </Col>
    </Animated>
  );
}
