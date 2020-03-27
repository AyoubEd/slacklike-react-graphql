import IconButton from "@material-ui/core/IconButton";
import InputBase from "@material-ui/core/InputBase";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import { withStyles } from "@material-ui/core/styles";
import { AttachFile, Send } from "@material-ui/icons";
import classNames from "classnames";
import gql from "graphql-tag";
import React, { Component } from "react";
import { Mutation } from "react-apollo";

const styles = theme => ({
  messagelist: {
    display: "flex",
    flexFlow: "column",
    height: "100%",
    alignItems: "flex-start"
  },
  messagebubble: {
    margin: 10
  },
  messageLeft: {
    alignSelf: "flex-start"
  },
  messageRight: {
    alignSelf: "flex-end"
  },
  message: {
    display: "flex",
    padding: 10,
    backgroundColor: "#C0C0C0",
    color: "#000",
    borderRadius: 10,
    width: "fit-content",
    maxWidth: 400,
    fontSize: "13px"
  },
  authorlabel: {
    alignSelf: "start",
    fontSize: "13px",
    width: "fit-content",
    paddingLeft: 5
  },
  input: {
    flexGrow: 1,
    position: "absolute",
    bottom: 0,
    left: 0,
    padding: 10,
    height: "28px",
    display: "flex",
    flexFlow: "row",
    width: "97%",
    borderTop: "1px solid #d3d3d3",
    maxWidth: "97%"
  },
  send: {
    width: "50px",
    position: "absolute",
    right: 0,
    bottom: 2,
    justifySelf: "center"
  },
  attachfile: {
    width: "50px",
    position: "absolute",
    right: 50,
    bottom: 2,
    justifySelf: "center"
  },
  extendedIcon: {
    marginRight: theme.spacing.unit
  },
  inmessage: {
    display: "flex",
    flexFlow: "row",
    color: "#fff",
    "&:hover": {
      color: "#000",
      cursor: "pointer"
    }
  },
  inputbase: {
    width: "60%"
  },
  menu: {
    boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.16)"
  },
  menuitem: {
    height: "5px"
  }
});

const ADD_MESSAGE = gql`
  mutation($name: String!, $author: String!, $body: String!) {
    addMessage(name: $name, author: $author, body: $body) {
      id
      author
      body
      deleted
    }
  }
`;

const DELETE_MESSAGE = gql`
  mutation($name: String!, $author: String!, $id: Int!) {
    deleteMessage(name: $name, author: $author, id: $id) {
      body
      author
      id
    }
  }
`;

const EDIT_MESSAGE = gql`
  mutation($name: String!, $author: String!, $id: Int!, $newbody: String!) {
    editMessage(name: $name, author: $author, id: $id, newbody: $newbody) {
      body
    }
  }
`;

class MessagingArea extends Component {
  constructor(props) {
    super(props);
    this.state = {
      owner: "Ayoub",
      messageInput: "",
      anchorEl: null,
      currentMessage: null,
      index: null
    };
  }

  handleClick = (event, msg, index) => {
    this.setState({
      anchorEl: event.currentTarget,
      currentMessage: msg,
      index: index,
      updatingMessage: {
        index: null,
        messageTxt: null
      }
    });
  };

  handleClose = () => {
    this.setState({ anchorEl: null });
  };

  messageInputChanges = name => event => {
    this.setState({
      [name]: event.target.value
    });
  };

  messageUpdateInputChanges = (event, index) => {
    this.setState({
      updatingMessage: {
        messageTxt: event.target.value,
        index: index
      }
    });
  };

  messageStartUpdate = (msg, index) => {
    this.setState({
      updatingMessage: {
        messageTxt: msg.body,
        index: index
      }
    });
  };

  handleCloseUpdate = () => {
    this.setState({
      updatingMessage: {
        messageTxt: null,
        index: null
      }
    });
  };

  render() {
    const { classes, name, messages } = this.props;
    const { owner, anchorEl, currentMessage } = this.state;
    return (
      <div className={classes.messagelist}>
        {messages.map((msg, index) => {
          if (msg.deleted === false) {
            const activeClass =
              msg.author === this.state.owner
                ? classes.messageRight
                : classes.messageLeft;
            const mergeClasses = classNames(classes.messagebubble, activeClass);
            return (
              <div className={mergeClasses} key={index}>
                <div className={classes.authorlabel}>{msg.author}:</div>
                <div className={classes.inmessage}>
                  <div className={classes.message}>
                    {this.state.updatingMessage &&
                      index === this.state.updatingMessage.index && (
                        <InputBase
                          multiline
                          value={
                            this.state.updatingMessage
                              ? this.state.updatingMessage.messageTxt
                              : msg.body
                          }
                          onChange={e =>
                            this.messageUpdateInputChanges(e, index)
                          }
                        />
                      )}
                    {(!this.state.updatingMessage ||
                      index !== this.state.updatingMessage.index) &&
                      msg.body}
                  </div>
                  <div onClick={e => this.handleClick(e, msg, index)}>...</div>
                  <Menu
                    id="simple-menu"
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={this.handleClose}
                    classes={{
                      paper: classes.menu
                    }}
                  >
                    <MenuItem
                      onClick={() => {
                        this.messageStartUpdate(
                          this.state.currentMessage,
                          this.state.index
                        );
                        this.handleClose();
                      }}
                      classes={{ root: classes.menuitem }}
                    >
                      Edit
                    </MenuItem>
                    <Mutation mutation={DELETE_MESSAGE}>
                      {postMutation => (
                        <MenuItem
                          onClick={() => {
                            postMutation({
                              variables: {
                                name: name,
                                author: currentMessage.author,
                                id: this.state.index
                              }
                            });
                            this.handleClose();
                          }}
                          classes={{ root: classes.menuitem }}
                        >
                          Delete
                        </MenuItem>
                      )}
                    </Mutation>
                  </Menu>
                </div>
                {this.state.updatingMessage &&
                  index === this.state.updatingMessage.index && (
                    <Mutation mutation={EDIT_MESSAGE}>
                      {postMutation => (
                        <div
                          style={{
                            display: "flex"
                          }}
                        >
                          <div
                            style={{
                              paddingRight: 5,
                              fontSize: 13,
                              textDecoration: "underline",
                              cursor: "pointer"
                            }}
                            onClick={() => {
                              postMutation({
                                variables: {
                                  name: name,
                                  author: currentMessage.author,
                                  id: this.state.index,
                                  newbody: this.state.updatingMessage.messageTxt
                                }
                              });
                              this.handleCloseUpdate();
                            }}
                          >
                            save
                          </div>
                          <div
                            style={{
                              fontSize: 13,
                              textDecoration: "underline",
                              cursor: "pointer"
                            }}
                            onClick={this.handleCloseUpdate}
                          >
                            cancel
                          </div>
                        </div>
                      )}
                    </Mutation>
                  )}
              </div>
            );
          }
        })}
        <div className={classes.input}>
          <Mutation mutation={ADD_MESSAGE}>
            {postMutation => (
              <InputBase
                placeholder="Write your message..."
                multiline
                value={this.state.messageInput}
                classes={{ root: classes.inputbase }}
                onChange={this.messageInputChanges("messageInput")}
                onKeyPress={event => {
                  if (event.key === "Enter" && event.ctrlKey) {
                    postMutation({
                      variables: {
                        name: name,
                        author: owner,
                        body: event.target.value
                      }
                    });
                    this.props.changeMessages(event.target.value);
                    this.setState({ messageInput: "" });
                  }
                }}
              />
            )}
          </Mutation>
          <IconButton className={classes.attachfile}>
            <AttachFile />
          </IconButton>

          <Mutation mutation={ADD_MESSAGE}>
            {postMutation => (
              <IconButton
                className={classes.send}
                onClick={e => {
                  postMutation({
                    variables: {
                      name: name,
                      author: owner,
                      body: this.state.messageInput
                    }
                  });
                  this.props.changeMessages(this.state.messageInput);
                  this.setState({ messageInput: "" });
                }}
              >
                <Send />
              </IconButton>
            )}
          </Mutation>
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(MessagingArea);
