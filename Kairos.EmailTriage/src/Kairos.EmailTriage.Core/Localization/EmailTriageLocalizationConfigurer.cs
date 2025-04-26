using Abp.Configuration.Startup;
using Abp.Localization.Dictionaries;
using Abp.Localization.Dictionaries.Xml;
using Abp.Reflection.Extensions;

namespace Kairos.EmailTriage.Localization
{
    public static class EmailTriageLocalizationConfigurer
    {
        public static void Configure(ILocalizationConfiguration localizationConfiguration)
        {
            localizationConfiguration.Sources.Add(
                new DictionaryBasedLocalizationSource(EmailTriageConsts.LocalizationSourceName,
                    new XmlEmbeddedFileLocalizationDictionaryProvider(
                        typeof(EmailTriageLocalizationConfigurer).GetAssembly(),
                        "Kairos.EmailTriage.Localization.SourceFiles"
                    )
                )
            );
        }
    }
}
