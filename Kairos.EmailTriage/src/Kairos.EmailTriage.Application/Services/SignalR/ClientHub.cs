using Abp.Dependency;
using Abp.Runtime.Session;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Kairos.EmailTriage.Services.SignalR
{
    public class ClientHub : Hub, ITransientDependency
    {
        public IAbpSession AbpSession { get; set; }

        public ILogger Logger { get; set; }

        public ClientHub()
        {
            AbpSession = NullAbpSession.Instance;
            Logger = NullLogger.Instance;
        }

        public override async Task OnConnectedAsync()
        {
            await base.OnConnectedAsync();
            Logger.LogDebug("A client connected to ChatHub: " + base.Context.ConnectionId);
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            await base.OnDisconnectedAsync(exception);
            Logger.LogDebug("A client disconnected from ChatHub: " + base.Context.ConnectionId);
        }
    }

    public class SignalrAppenderHub : Hub
    {
        //
        // Summary:
        //     Join group
        //
        // Parameters:
        //   groupName:
        //     Name of the group
        public async Task JoinGroupAsync(string groupName)
        {
            await base.Groups.AddToGroupAsync(base.Context.ConnectionId, groupName);
        }

        //
        // Summary:
        //     Leave group
        //
        // Parameters:
        //   groupName:
        //     Name of the group
        public async Task LeaveGroupAsync(string groupName)
        {
            await base.Groups.RemoveFromGroupAsync(base.Context.ConnectionId, groupName);
        }
    }
}
