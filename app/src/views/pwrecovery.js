import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";

const styles = theme => ({
  login: {
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

class PasswordRecovery extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: ""
    };
  }

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value
    });
  };

  handleLogin = event => {
    console.log(this.state);
  };

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.login}>
        <form className={classes.container} noValidate autoComplete="off">
          <TextField
            id="email"
            label="Email"
            className={classes.textField}
            value={this.state.name}
            onChange={this.handleChange("email")}
            margin="normal"
          />
        </form>
        <Button
          variant="outlined"
          className={classes.button}
          onClick={this.handleLogin}
        >
          SEND
        </Button>
      </div>
    );
  }
}

export default withStyles(styles)(PasswordRecovery);
