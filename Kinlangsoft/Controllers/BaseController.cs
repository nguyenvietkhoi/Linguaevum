using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Utility;

namespace Linguaevum.Controllers
{
    public class BaseController : Controller
    {
        //
        // GET: /Base/
        public ActionResult ChangeCurrentCulture(int id)
        {
            //
            // Change the current culture for this user.
            //
            SessionManager.CurrentCulture = id;
            //
            // Cache the new current culture into the user HTTP session. 
            //
            Session["CurrentCulture"] = id;
            //
            // Redirect to the same page from where the request was made! 
            //
            return Redirect(Request.UrlReferrer.ToString());
        }

        protected override void ExecuteCore()
        {
            int culture;
            if (Session == null || Session["CurrentCulture"] == null)
            {
                int.TryParse(System.Web.Configuration.WebConfigurationManager.AppSettings["Culture"], out culture);
                Session["CurrentCulture"] = culture;
            }
            else
            {
                culture = (int)Session["CurrentCulture"];
            }
            //
            SessionManager.CurrentCulture = culture;
            //
            // Invokes the action in the current controller context.
            //
            base.ExecuteCore();
        }

        protected override bool DisableAsyncSupport
        {
            get { return true; }
        }
	}
}