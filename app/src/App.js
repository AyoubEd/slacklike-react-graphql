import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
//GraphQL Stuff
// import ApolloClient from "apollo-boost";
import { ApolloProvider } from "react-apollo";
import { split } from "apollo-link";
import { HttpLink } from "apollo-link-http";
import { WebSocketLink } from "apollo-link-ws";
import { getMainDefinition } from "apollo-utilities";
import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { onError } from "apollo-link-error";
import { ApolloLink } from "apollo-link";
import { setContext } from "apollo-link-context";
//Pages
import SignUp from "./views/signup";
import Login from "./views/login";
import MainPage from "./views/mainpage";
import PasswordRecovery from "./views/pwrecovery";

const styles = theme => ({
  root: {
    flexGrow: 1
  }
});

// Create an http link:
const httpLink = new HttpLink({
  uri: "http://localhost:4000/graphql",
  credentials: "same-origin"
});

// Create a WebSocket link:
const wsLink = new WebSocketLink({
  uri: `ws://localhost:4000/graphql`,
  options: {
    reconnect: true
  }
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      ...headers,
      authorization: token ? token : null
    }
  };
});

const link = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query);
    return kind === "OperationDefinition" && operation === "subscription";
  },
  wsLink,
  authLink.concat(httpLink)
);

const client = new ApolloClient({
  link: ApolloLink.from([
    onError(({ graphQLErrors, networkError }) => {
      if (graphQLErrors)
        graphQLErrors.map(({ message, locations, path }) =>
          console.log(
            `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
          )
        );
      if (networkError) console.log(networkError);
    }),
    link
  ]),
  cache: new InMemoryCache()
});

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    return (
      <ApolloProvider client={client}>
        <Router>
          <Switch>
            <Route path="/dashboard/" component={MainPage} />
            <Route path="/signup/" component={SignUp} />
            <Route path="/pwrecovery/" component={PasswordRecovery} />
            <Route path="/" component={Login} />
          </Switch>
        </Router>
      </ApolloProvider>
    );
  }
}

export default withStyles(styles)(App);
