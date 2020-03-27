import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import InputAdornment from "@material-ui/core/InputAdornment";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import { Link } from "react-router-dom";
import { Mutation } from "react-apollo";
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

const LOGIN = gql`
  mutation($email: String!, $password: String!) {
    authUser(email: $email, password: $password) {
      user {
        email
      }
      token
    }
  }
`;

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
      showpassword: false
    };
  }

  componentDidMount() {}

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value
    });
  };

  handleClickShowPassword = () => {
    this.setState(state => ({ showPassword: !state.showPassword }));
  };
  render() {
    const { classes } = this.props;
    return (
      <div className={classes.page}>
        <form className={classes.container} noValidate autoComplete="off">
          <TextField
            id="email"
            label="Email"
            className={classes.textField}
            value={this.state.email}
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
          mutation={LOGIN}
          onCompleted={data => {
            localStorage.setItem("token", data.authUser.token);
            this.props.history.push({
              pathname: "/dashboard",
              state: { loggedIn: true }
            });
          }}
        >
          {postMutation => (
            <Button
              variant="outlined"
              className={classes.button}
              onClick={e => {
                postMutation({
                  variables: {
                    email: this.state.email,
                    password: this.state.password
                  }
                });
              }}
            >
              LOGIN
            </Button>
          )}
        </Mutation>
        <Link to="/pwrecovery">Forgot Password</Link>
      </div>
    );
  }
}

export default withStyles(styles)(Login);
