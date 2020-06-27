using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.SessionState;
using System.Globalization;
using System.Threading;

namespace Utility
{
    public class SessionManager
    {
        protected HttpSessionState session;

        public SessionManager(HttpSessionState httpSessionState)
        {
            session = httpSessionState;
        }

        public static int CurrentCulture
        {
            get
            {
                if (Thread.CurrentThread.CurrentUICulture.Name == "vi-VN")
                    return 1;
                if (Thread.CurrentThread.CurrentUICulture.Name == "en-US")
                    return 0;
                if (Thread.CurrentThread.CurrentUICulture.Name == "zh-Hant")
                    return 2;
                return 0;
            }
            set
            {
                //
                // Set the thread's CurrentUICulture.
                //
                if (value == 1)
                    Thread.CurrentThread.CurrentUICulture = new CultureInfo("vi-VN");
                else if (value == 0)
                    Thread.CurrentThread.CurrentUICulture = new CultureInfo("en-US");
                else if (value == 2)
                    Thread.CurrentThread.CurrentUICulture = new CultureInfo("zh-Hant");
                else
                    Thread.CurrentThread.CurrentUICulture = CultureInfo.InvariantCulture;
                //
                // Set the thread's CurrentCulture the same as CurrentUICulture.
                //
                Thread.CurrentThread.CurrentCulture = Thread.CurrentThread.CurrentUICulture;
            }
        }
    }
}