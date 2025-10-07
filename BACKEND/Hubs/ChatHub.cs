using System;
using System.Collections.Concurrent;
using BACKEND.Data;
using BACKEND.DTOs;
using BACKEND.Extenions;
using BACKEND.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace BACKEND.Hubs;

[Authorize]
public class ChatHub(UserManager<AppUser> userManager, AppDbContext context) : 
Hub
{
    public static readonly ConcurrentDictionary<string, OnlineUserDto> onlineUsers = new();

    public override async Task OnConnectedAsync()
    {
        var httpContext = Context.GetHttpContext();
        var recevierId = httpContext?.Request.Query["senderId"].ToString();
        var userName = Context.User!.Identity!.Name!;
        var currentUser = await userManager.FindByNameAsync(userName);
        var connectionId = Context.ConnectionId;

        if (onlineUsers.ContainsKey(userName))
        {
            onlineUsers[userName].ConnectionId = connectionId;
        }
        else
        {
            var user = new OnlineUserDto
            {
                ConnectionId = connectionId,
                UserName = userName,
                ProfilePicture = currentUser!.ProfileImage,
                FullName = currentUser!.FullName
            };
            onlineUsers.TryAdd(userName, user);

            await Clients.AllExcept(connectionId).SendAsync("Notify", currentUser);
        }

        if (!string.IsNullOrEmpty(recevierId))
        {
            await LoadMessages(recevierId);
        }
        await Clients.All.SendAsync("OnlineUsers", await GetAllUsers());

    }


    public async Task LoadMessages(string recipientId, int pageNumber = 1)
    {
        int pageSize = 10;
        var username = Context.User!.Identity!.Name;
        var currentUser = await userManager.FindByNameAsync(username!);
        if (currentUser is null)
        {
            return;
        }

        List<MessageResponseDto> messages = await context.Messages
        .Where(x => x.RecerverId == currentUser!.Id && x.SenderId ==
        recipientId || x.SenderId == currentUser!.Id && x.RecerverId ==
        recipientId)
        .OrderByDescending(x => x.CreateDate)
        .Skip((pageNumber - 1) * pageSize)
        .Take(pageSize)
        .OrderBy(x => x.CreateDate)
        .Select(x => new MessageResponseDto
        {
            Id = x.Id,
            Content = x.Content,
            CreateDate = x.CreateDate,
            ReceiverId = x.RecerverId,
            SenderId = x.SenderId
        }).ToListAsync();

        foreach (var message in messages)
        {
            var msg = await context.Messages.FirstOrDefaultAsync(x => x.Id == message.Id);

            if (msg != null && msg.RecerverId == currentUser.Id)
            {
                msg.IsRead = true;
                await context.SaveChangesAsync();
            }
        }
        await Task.Delay(1000);
        await Clients.User(currentUser.Id).SendAsync("ReceiveMessageList", messages);
    }
    public async Task SendMessage(MessageRequestDto message)
    {
        var senderId = Context.User!.Identity!.Name;
        var receiverId = message.ReceiverId;

        var newMsg = new Message
        {
            Sender = await userManager.FindByNameAsync(senderId!),
            Recerver = await userManager.FindByIdAsync(receiverId!),
            IsRead = false,
            CreateDate = DateTime.UtcNow,
            Content = message.Content
        };

        context.Messages.Add(newMsg);
        await context.SaveChangesAsync();

        await Clients.User(receiverId!).SendAsync("ReceiveNewMessage", newMsg);
    }

    public async Task NotifyTyping(string recipientUSerName)
    {
        var senderUserName = Context.User!.Identity!.Name;

        if (senderUserName is null)
        {
            return;
        }

        var connectionId = onlineUsers.Values.FirstOrDefault(x => x.UserName == recipientUSerName)?.ConnectionId;

        if (connectionId != null)
        {
            await Clients.Client(connectionId).SendAsync("NotifytypingToUser", senderUserName);
        }
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {

        var username = Context.User!.Identity!.Name;
        onlineUsers.TryRemove(username!, out _);
        await Clients.All.SendAsync("OnlineUsers", await GetAllUsers());
    }
    private async Task<IEnumerable<OnlineUserDto>> GetAllUsers()
    {
        var username = Context.User!.GetUserName();
        var onlineUserSet = new HashSet<string>(onlineUsers.Keys);

        var users = await userManager.Users.Select(u => new OnlineUserDto
        {
            Id = u.Id,
            UserName = u.UserName,
            FullName = u.FullName,
            ProfilePicture = u.ProfileImage,
            IsOnline = onlineUserSet.Contains(u.UserName!),
            UnreadCount = context.Messages.Count(x => x.RecerverId == username && x.SenderId == u.Id && !x.IsRead)
        }).OrderByDescending(u => u.IsOnline)
        .ToListAsync();

        return users;
    }
}
