import ChannelModel from "../models/channelmodel";
import UserModel from "../models/usermodel";
import { PubSub } from "graphql-subscriptions";
import { AuthenticationError, UserInputError } from "apollo-server";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Channel, Message, User, AuthPayload } from "./types";

export const pubsub = new PubSub();

const createToken = async (email, password): Promise<string> => {
  return await jwt.sign({ email: email, password: password }, "secret", {
    expiresIn: "1h"
  });
};

const verifyToken = async (token): Promise<string> => {
  return await jwt.verify(token, "secret", (err, decoded) => {
    if (err) return err;
    return decoded;
  });
};

export interface IStorage {
  //User Related
  getUsers(): [User];
  getUserById(id: number): User;
  getUserByEmail(email: string): User;
  addUser(
    email: string,
    password: string,
    firstname: string,
    lastname: string
  ): Promise<AuthPayload>;
  updateUser(args: any): User;
  deleteUser(args: any): string;

  //Channel related
  getChannels(): [Channel];
  getChannel(name: string): Channel;
  addChannel(name: string, owner: string): Channel;
  updateChannel(name: string, newname: string, owner: string): Channel;
  deleteChannel(name: string, owner: string): Channel;
  addMessageToChannel(name: string, author: string, body: string): [Message];
  deleteMessageInChannel(name: String, author: string, id: number): [Message];
  addMember(name: string, owner: string, email: string): [User];
  deleteMember(name: string, owner: string, email: string): [User];
}

export class StorageService implements IStorage {
  //User related
  getUsers(): [User] {
    return UserModel.find({})
      .then(res => {
        return res;
      })
      .catch(err => "Error fetching users!");
  }
  getUserById(id: number): User {
    return UserModel.findById({ id: id })
      .then(res => {
        return res;
      })
      .catch(err => "User not found!");
  }
  getUserByEmail(email: string): User {
    return UserModel.findOne({ email: email })
      .then(res => {
        return res;
      })
      .catch(err => "User not found!");
  }
  getUserByToken(token): any {
    const dec = verifyToken(token);
    return dec;
  }
  //TODO: VALIDAOR for email and password
  async addUser(
    email: string,
    password: string,
    firstname: string,
    lastname: string
  ): Promise<AuthPayload> {
    password = await bcrypt.hash(password, 10);
    const newUser = new UserModel({
      firstname: firstname,
      lastname: lastname,
      email: email,
      password: password
    });

    return newUser
      .save()
      .then(data => {
        return { token: createToken(data.email, data.password), user: newUser };
      })
      .catch(err => "Cant add user.");
  }
  async authUser(email: string, password: string): Promise<AuthPayload> {
    const user = await this.getUserByEmail(email);
    if (!user) {
      throw new UserInputError("No user found with this login credentials.");
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) throw new AuthenticationError("Invalid password.");

    if (user && valid && !user.deleted) {
      return { token: createToken(user.email, user.password), user: user };
    }
  }
  updateUser(args: any): User {
    return UserModel.findOneAndUpdate({ email: args.email }, args, {
      new: true
    })
      .then(user => {
        return user;
      })
      .catch(err => "cant update user.");
  }
  deleteUser(args: any): string {
    args.deleted = true;
    return UserModel.findOneAndUpdate({ email: args.email }, args, {
      new: true
    })
      .then(user => {
        return user;
      })
      .catch(err => "cant delete user.");
  }

  //Channel related
  getChannels(): [Channel] {
    return ChannelModel.find({})
      .then(res => {
        return res;
      })
      .catch(err => "Error fetching channels!");
  }
  getChannel(name: string): Channel {
    return ChannelModel.find({ name: name })
      .then(res => res)
      .catch(err => err);
  }
  addChannel(name: string, owner: string): Channel {
    const newChannel = new ChannelModel({
      name: name,
      owner: owner,
      members: [],
      messages: [],
      deleted: false
    });
    return newChannel
      .save()
      .then(res => {
        return res;
      })
      .catch(err => "Cant add Channel.");
  }

  updateChannel(name: string, newname: string, owner: string): Channel {
    return ChannelModel.findOne({ name: name })
      .then(res => {
        if (res.owner === owner) {
          return ChannelModel.findOneAndUpdate(
            { name: name },
            { name: newname },
            {
              new: true
            }
          )
            .then(res => {
              return res;
            })
            .catch(err => "cant update channel name.");
        } else throw new Error("You are not authorized to update this channel");
      })
      .catch(err => err);
  }

  deleteChannel(name: string, owner: string): Channel {
    return ChannelModel.findOne({ name: name })
      .then(res => {
        if (res.owner === owner) {
          return ChannelModel.findOneAndUpdate(
            { name: name },
            { deleted: true },
            {
              new: true
            }
          )
            .then(res => {
              return res;
            })
            .catch(err => "cant delete channel name.");
        } else throw new Error("You are not authorized to delete this channel");
      })
      .catch(err => err);
  }

  addMessageToChannel(name: string, author: string, body: string): [Message] {
    return ChannelModel.findOne({ name: name })
      .then(res => {
        const newMessage: Message = {
          id: Number.isInteger(res.messages.length) ? res.messages.length : 0,
          author: author,
          body: body,
          deleted: false
        };
        const messages = res.messages ? res.messages : [];
        messages.push(newMessage);
        pubsub.publish("messageAdded", {
          messageAdded: messages,
          name: name
        });
        return ChannelModel.findOneAndUpdate(
          { name: name },
          { messages: messages },
          {
            new: true
          }
        )
          .then(res => {
            return res.messages;
          })
          .catch(err => "cant send new message.");
      })
      .catch(err => err);
  }

  editMessageInChannel(
    name: string,
    author: string,
    id: number,
    newbody: string
  ): [Message] {
    return ChannelModel.findOne({ name: name })
      .then(res => {
        const messages = res.messages;
        if (messages[id].author === author) {
          const newMessage: Message = {
            id: id,
            author: author,
            body: newbody,
            deleted: false
          };
          messages[id] = newMessage;
          pubsub.publish("messageAdded", {
            messageAdded: messages,
            name: name
          });
          return ChannelModel.findOneAndUpdate(
            { name: name },
            { messages: messages },
            {
              new: true
            }
          )
            .then(res => {
              return res.messages;
            })
            .catch(err => "cant update message.");
        } else throw new Error("You are not the message author");
      })
      .catch(err => err);
  }

  deleteMessageInChannel(name: String, author: string, id: number): [Message] {
    return ChannelModel.findOne({ name: name })
      .then(res => {
        const messages = res.messages;
        if (messages[id].author === author) {
          messages[id].deleted = true;
          pubsub.publish("messageAdded", {
            messageAdded: messages,
            name: name
          });
          return ChannelModel.findOneAndUpdate(
            { name: name },
            { messages: messages },
            {
              new: true
            }
          )
            .then(res => {
              return res.messages;
            })
            .catch(err => "cant delete message.");
        } else throw new Error("You are not the message author");
      })
      .catch(err => err);
  }

  addMember(name: string, owner: string, email: string): [User] {
    return ChannelModel.findOne({ name: name })
      .then(res => {
        if (res.owner === owner) {
          const members = res.members ? res.members : [];

          return UserModel.findOne({ email: email })
            .then(usr => {
              const ussr = members.length > 0 ? members.find(ele => ele) : null;
              if (!ussr || ussr.email !== email) members.push(usr);
              return ChannelModel.findOneAndUpdate(
                { name: name },
                { members: members },
                {
                  new: true
                }
              )
                .then(result => {
                  return result.members;
                })
                .catch(err => "cant add new member.");
            })
            .catch(err => "User not found!");
        } else
          throw new Error(
            "You are not authorized to add members to this channel!"
          );
      })
      .catch(err => err);
  }

  deleteMember(name: string, owner: string, email: string): [User] {
    return ChannelModel.findOne({ name: name })
      .then(res => {
        const members = res.members;
        if (res.owner === owner) {
          const ussr = this.getUserByEmail(email);
          const i = members.indexOf(ussr);
          members.splice(i, 1);
          return ChannelModel.findOneAndUpdate(
            { name: name },
            { members: members },
            {
              new: true
            }
          )
            .then(res => {
              return res.members;
            })
            .catch(err => "cant delete member.");
        } else
          throw new Error(
            "You are not authorized to delete members from this channel!"
          );
      })
      .catch(err => err);
  }
}
