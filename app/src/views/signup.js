import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import InputAdornment from "@material-ui/core/InputAdornment";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import { Mutation, Query, Subscription } from "react-apollo";
import gql from "graphql-tag";

const styles = theme => ({
  page: {
    display: "Flex",
    flexGrow: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center"
  },
  container: {
    display: "flex",
    flexWrap: "wrap",
    flexFlow: "column",
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: "10vh"
  },
  textField: {
    flex: "0 1 auto",
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 400
  },
  button: {
    width: "100px",
    margin: "15px"
  }
});

const ADD_USER = gql`
  mutation(
    $email: String!
    $password: String!
    $firstname: String!
    $lastname: String!
  ) {
    addUser(
      email: $email
      password: $password
      firstname: $firstname
      lastname: $lastname
    ) {
      token
      user {
        email
      }
    }
  }
`;

class SignUp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      firstname: "",
      lastname: "",
      email: "",
      password: "",
      showpassword: false
    };
  }

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value
    });
  };

  handleClickShowPassword = () => {
    this.setState(state => ({ showPassword: !state.showPassword }));
  };

  _confirm = async data => {
    const { token, user } = data;
    console.log(token);
    console.log(user);
    this.setState({ user });
    localStorage.setItem("auth-token", token);
    this.props.history.push(`/`);
  };

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.page}>
        <form className={classes.container} noValidate autoComplete="off">
          <TextField
            id="firstname"
            label="First Name"
            className={classes.textField}
            value={this.state.name}
            onChange={this.handleChange("firstname")}
            margin="normal"
          />
          <TextField
            id="lastname"
            label="Last Name"
            className={classes.textField}
            value={this.state.name}
            onChange={this.handleChange("lastname")}
            margin="normal"
          />
          <TextField
            id="email"
            label="Email"
            className={classes.textField}
            value={this.state.name}
            onChange={this.handleChange("email")}
            margin="normal"
          />
          <TextField
            id="password"
            label="Confirm Password"
            className={classes.textField}
            value={this.state.name}
            type={this.state.showPassword ? "text" : "password"}
            onChange={this.handleChange("password")}
            margin="normal"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="Toggle password visibility"
                    onClick={this.handleClickShowPassword}
                  >
                    {this.state.showPassword ? (
                      <VisibilityOff />
                    ) : (
                      <Visibility />
                    )}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </form>
        <Mutation
          mutation={ADD_USER}
          onCompleted={data => this._confirm(data.addUser)}
        >
          {postMutation => (
            <Button
              variant="outlined"
              className={classes.button}
              onClick={() => {
                postMutation({
                  variables: {
                    email: this.state.email,
                    password: this.state.password,
                    firstname: this.state.firstname,
                    lastname: this.state.lastname
                  }
                });
              }}
            >
              SIGN UP
            </Button>
          )}
        </Mutation>
      </div>
    );
  }
}

export default withStyles(styles)(SignUp);
