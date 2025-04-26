FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

WORKDIR /src
COPY ["src/Kairos.EmailTriage.Web.Host/Kairos.EmailTriage.Web.Host.csproj", "src/Kairos.EmailTriage.Web.Host/"]
COPY ["src/Kairos.EmailTriage.Web.Core/Kairos.EmailTriage.Web.Core.csproj", "src/Kairos.EmailTriage.Web.Core/"]
COPY ["src/Kairos.EmailTriage.Application/Kairos.EmailTriage.Application.csproj", "src/Kairos.EmailTriage.Application/"]
COPY ["src/Kairos.EmailTriage.Core/Kairos.EmailTriage.Core.csproj", "src/Kairos.EmailTriage.Core/"]
COPY ["src/Kairos.EmailTriage.EntityFrameworkCore/Kairos.EmailTriage.EntityFrameworkCore.csproj", "src/Kairos.EmailTriage.EntityFrameworkCore/"]
WORKDIR "/src/src/Kairos.EmailTriage.Web.Host"
RUN dotnet restore 

WORKDIR /src
COPY ["src/Kairos.EmailTriage.Web.Host", "src/Kairos.EmailTriage.Web.Host"]
COPY ["src/Kairos.EmailTriage.Web.Core", "src/Kairos.EmailTriage.Web.Core"]
COPY ["src/Kairos.EmailTriage.Application", "src/Kairos.EmailTriage.Application"]
COPY ["src/Kairos.EmailTriage.Core", "src/Kairos.EmailTriage.Core"]
COPY ["src/Kairos.EmailTriage.EntityFrameworkCore", "src/Kairos.EmailTriage.EntityFrameworkCore"]
WORKDIR "/src/src/Kairos.EmailTriage.Web.Host"
RUN dotnet publish -c Release -o /publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0
EXPOSE 80
WORKDIR /app
COPY --from=build /publish .
ENTRYPOINT ["dotnet", "Kairos.EmailTriage.Web.Host.dll"]
