using System.Collections.Generic;

namespace Kairos.EmailTriage.Authentication.External
{
    public interface IExternalAuthConfiguration
    {
        List<ExternalLoginProviderInfo> Providers { get; }
    }
}
