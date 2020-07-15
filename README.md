This is a slack clone leveraging GraphQl subscriptions and built using NodeJS and React.js.

    • Users and authentication
        ◦ User creation
        ◦ Authentication with stateless session
    • Conversation channels
        ◦ Create a channel
        ◦ List the channels
        ◦ List the messages inside a channel
        ◦ Send a message to a channel
    • Store eveythong in MongoDB

    • Extended user:
        ◦ Update/delete user
        ◦ Email verification
        ◦ Password recovery
    • Extended channel: 
        ◦ Delete a channel
        ◦ A channel owner can invite/kick another user into to/from his channel
        ◦ Authorization: users cannot read nor write into channel they aren’t a member of
    • Extended message:
        ◦ Update/delete messages
        ◦ Add image/file to a message
        ◦ Url metadata enrichment 
        ◦ Message advanced search
    • Api unit testing
