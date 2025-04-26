using Kairos.EmailTriage.Debugging;

namespace Kairos.EmailTriage
{
    public class EmailTriageConsts
    {
        public const string LocalizationSourceName = "EmailTriage";

        public const string ConnectionStringName = "Default";

        public const bool MultiTenancyEnabled = true;


        /// <summary>
        /// Default pass phrase for SimpleStringCipher decrypt/encrypt operations
        /// </summary>
        public static readonly string DefaultPassPhrase =
            DebugHelper.IsDebug ? "gsKxGZ012HLL3MI5" : "124836dcfb414e13a43d79979963044b";
    }
}
