import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import InputBase from "@material-ui/core/InputBase";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import { withStyles } from "@material-ui/core/styles";
import { HighlightOff, PlaylistAdd } from "@material-ui/icons";
import gql from "graphql-tag";
import React, { Component } from "react";
import { Mutation, Query, Subscription } from "react-apollo";
import MessagingArea from "./messagingarea";

const styles = theme => ({
  root: {
    flexGrow: 1
  },
  paper: {
    padding: theme.spacing.unit * 2,
    textAlign: "center",
    color: theme.palette.text.secondary,
    height: "95vh",
    borderRadius: 0,
    position: "relative"
  },
  channelsList: {},
  messagesList: {},
  textField: {
    flexGrow: 1,
    position: "absolute",
    bottom: 0,
    left: 0,
    paddingLeft: "5px",
    display: "flex",
    flexFlow: "row",
    borderTop: "1px solid #d3d3d3",
    width: "100%"
  },
  divider: {
    width: 1,
    height: "100vh"
  },
  deletechannel: {
    color: "#ffffff",
    fontSize: "17px",
    "&:hover": {
      color: "#d3d3d3"
    }
  }
});

const GET_CHANNELS = gql`
  {
    getChannels {
      name
      owner
      deleted
      messages {
        author
        body
        deleted
      }
    }
  }
`;

const ADD_CHANNEL = gql`
  mutation($name: String!, $owner: String!) {
    addChannel(name: $name, owner: $owner) {
      name
      owner
      deleted
    }
  }
`;

const DELETE_CHANNEL = gql`
  mutation($name: String!, $owner: String!) {
    deleteChannel(name: $name, owner: $owner) {
      name
      owner
      deleted
    }
  }
`;

const MESSAGE_ADDED = gql`
  subscription messageAdded($name: String!) {
    messageAdded(name: $name) {
      author
      body
      deleted
    }
  }
`;

class MainPage extends Component {
  constructor(props) {
    super(props);
    this.changeMessages = this.changeMessages.bind(this);
    this.state = {
      newChannel: "",
      owner: "Ayoub",
      name: "",
      messages: [],
      loggedIn: false
    };
  }

  componentWillMount() {
    if (this.props.location.state)
      this.setState({ loggedIn: this.props.location.state.loggedIn });
  }

  channelInputChanges = name => event => {
    this.setState({
      [name]: event.target.value
    });
  };

  changeMessages = message => {
    const messages = this.state.messages;
    messages.push({ author: this.state.owner, body: message });
    this.setState({ messages: messages });
  };

  render() {
    const { classes, history } = this.props;
    const { newChannel, owner, name } = this.state;
    if (!this.state.loggedIn)
      return (
        <div>
          <div>You need to authenticate before vewing this page</div>
          <a href="/login" onClick={() => history.push("/")}>
            Go
          </a>
        </div>
      );
    else
      return (
        <div>
          <Grid container>
            <Grid
              item
              xs={12}
              sm={3}
              style={{ borderRight: "1px solid #d3d3d3" }}
            >
              <div className={classes.paper}>
                Channels
                <List component="nav">
                  <Query
                    query={GET_CHANNELS}
                    pollInterval={5000}
                    // onCompleted={a => {
                    //   if (!a.getChannels) history.push("/");
                    // }}
                  >
                    {({ loading, error, data }) => {
                      if (loading) return <p>Loading...</p>;
                      if (error) return <p>Error :(</p>;
                      if (!data.getChannels) {
                        this.setState({ loggedIn: false });
                        return <p>Error :(</p>;
                      } else
                        return data.getChannels.map(
                          ({ name, deleted, messages }) => {
                            if (deleted === false) {
                              return (
                                <ListItem
                                  button
                                  key={name}
                                  onClick={() => {
                                    this.setState({
                                      name: name,
                                      messages: messages
                                    });
                                  }}
                                >
                                  <ListItemIcon>
                                    <div>#</div>
                                  </ListItemIcon>
                                  <ListItemText primary={name} />
                                  <Mutation
                                    mutation={DELETE_CHANNEL}
                                    variables={{ name: name, owner }}
                                  >
                                    {postMutation => (
                                      <HighlightOff
                                        className={classes.deletechannel}
                                        onClick={postMutation}
                                      />
                                    )}
                                  </Mutation>
                                </ListItem>
                              );
                            }
                          }
                        );
                    }}
                  </Query>
                </List>
                <div className={classes.textField}>
                  <Mutation mutation={ADD_CHANNEL}>
                    {postMutation => (
                      <div style={{ display: "flex" }}>
                        <IconButton
                          onClick={() => {
                            postMutation({
                              variables: { name: newChannel, owner }
                            });
                            this.setState({ newChannel: "" });
                          }}
                        >
                          <PlaylistAdd />
                        </IconButton>
                        <InputBase
                          name="channelInput"
                          placeholder="Add a channel..."
                          id="Add channel"
                          value={this.state.newChannel}
                          onChange={this.channelInputChanges("newChannel")}
                          onKeyPress={event => {
                            if (event.key === "Enter") {
                              postMutation({
                                variables: { name: newChannel, owner }
                              });
                              this.setState({ newChannel: "" });
                            }
                          }}
                        />
                      </div>
                    )}
                  </Mutation>
                </div>
              </div>
            </Grid>
            <Grid item xs={12} sm={9}>
              <div className={classes.paper}>
                Messages
                <Subscription subscription={MESSAGE_ADDED} variables={{ name }}>
                  {({ data, loading }) => {
                    if (loading)
                      return (
                        <MessagingArea
                          name={this.state.name}
                          messages={this.state.messages}
                          changeMessages={this.changeMessages}
                        />
                      );
                    return (
                      <MessagingArea
                        name={this.state.name}
                        messages={data.messageAdded}
                        changeMessages={this.changeMessages}
                      />
                    );
                  }}
                </Subscription>
              </div>
            </Grid>
          </Grid>
        </div>
      );
  }
}

export default withStyles(styles)(MainPage);
