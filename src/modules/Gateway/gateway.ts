import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Types } from "mongoose";
import { Server, Socket } from "socket.io";
import { getSocketAuth,type ISocketAuth, RoleEnum, TokenEnum } from "src/common";
import { Auth, User } from "src/common/decorators";
import { TokenService } from "src/common/services/token.service";
import { connectedSockets, type UserDocument } from "src/DB";

@WebSocketGateway({
  cors: {
    origin: "*",
  },
  namespace: "public",
})
export class RealtimeGateway implements OnGatewayInit ,OnGatewayConnection,OnGatewayDisconnect{
    @WebSocketServer()
    private readonly server: Server;
    constructor(
        private readonly tokenService: TokenService,
    ) { }
    
    afterInit(server: Server) {
        console.log(`Realtime Gateway Started ✨`);
        server.on("connection", (socket: Socket) => {
            console.log(socket.id);
        });
    }

    async handleConnection(client: ISocketAuth) {
        try {
            // console.log(client.id);
        // console.log(`auth :`, client.handshake.headers);
        // console.log(`author :`, client.handshake.auth.authorization);

        const authorization = getSocketAuth(client);

        console.log(authorization);
        const { user, decoded } = await this.tokenService.decodeToken({ authorization, tokenType: TokenEnum.access });
            console.log({ user, decoded });
            const userTabs = connectedSockets.get(user._id.toString()) || [];
            userTabs.push(client.id);
            connectedSockets.set(user._id.toString(), userTabs);
            client.credentials = { user, decoded };
            console.log({ userTabs, connectedSockets });
            
        } catch (error) {
            client.emit("exception", error.message || "something went wrong");
        }
        
    }
    
    handleDisconnect(client: ISocketAuth) {
        const userId = client.credentials?.user._id?.toString() as string;
        const remainingTabs = connectedSockets.get(userId)?.filter(tab => {
            return tab !== client.id;
        });

        if (remainingTabs?.length) {
            connectedSockets.set(userId, remainingTabs);
        } else {
            connectedSockets.delete(userId);
            this.server.emit("offline_user", userId);
        }

        console.log({ afterDisconnect: connectedSockets });
        console.log(`Logout ::: ${client.id}`);
    }

    @Auth([RoleEnum.user])
    @SubscribeMessage("sayHi")
    sayHi(
        @MessageBody() data: any,
        @ConnectedSocket() client: ISocketAuth,
        @User() user:UserDocument,
    ) {
        console.log({ data, user});
        client.emit("sayHi", "From Nest To Front");
       // client.broadcast.emit("sayHi", "From Nest To all Front");
        //this.server.emit("sayHi","lk")

        return "Received Data";


    }


    changeProductStock(products: { productId: Types.ObjectId, stock: number }[]) {
        this.server.emit("changeProductStock", products);
    }

}
