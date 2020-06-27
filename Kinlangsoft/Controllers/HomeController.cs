using System;
using System.IO;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
//using System.Data.SQLite;
//using System.Data.SQLite.Linq;

namespace Linguaevum.Controllers
{
    public class HomeController : BaseController
    {
        //private SQLiteConnection nomime_con = new SQLiteConnection("Data Source=nomime.db;Version=3;");
        //public string opttable = "rubynom";
        //public string optruby = "ruby";
        //public string optlev = "and level>1";

        public ActionResult Index()
        {
            //ViewBag.Title = App_GlobalResources.GUILang.Home;
            return View();
        }

        public ActionResult About()
        {
            ViewBag.Message = "Your application description page.";

            return View();
        }

        public ActionResult Contact()
        {
            ViewBag.Message = "Your contact page.";

            return View();
        }

        public ActionResult Player()
        {
            ViewBag.Message = "Your contact page.";

            return View();
        }

        public ActionResult Map()
        {
            ViewBag.Message = "Your contact page.";

            return View();
        }

        public ActionResult IMEmobile()
        {
            ViewBag.Message = App_GlobalResources.GUILang.IMETitle;
            ViewBag.Title = App_GlobalResources.GUILang.IME + " -";

            return View();
        }

        public ActionResult IME()
        {
            ViewBag.Message = App_GlobalResources.GUILang.Sinic;
            ViewBag.Title = App_GlobalResources.GUILang.Sinic + " -";
            string visitor = "";
            string ipList = Request.ServerVariables["HTTP_X_FORWARDED_FOR"];

            if (!string.IsNullOrEmpty(ipList))
            {
                visitor = ipList.Split(',')[0];
            }

            visitor = Request.ServerVariables["REMOTE_ADDR"];

            using (StreamWriter sw = System.IO.File.AppendText("D:\\visitors.log"))
            {
                sw.WriteLine(DateTime.UtcNow.ToString() + "\t" + visitor);
            }
            return View();
        }

        public ActionResult Brahmic()
        {
            ViewBag.Message = App_GlobalResources.GUILang.Brahmic;
            ViewBag.Title = App_GlobalResources.GUILang.Brahmic + " -";
            string visitor = "";
            string ipList = Request.ServerVariables["HTTP_X_FORWARDED_FOR"];

            if (!string.IsNullOrEmpty(ipList))
            {
                visitor = ipList.Split(',')[0];
            }

            visitor = Request.ServerVariables["REMOTE_ADDR"];

            using (StreamWriter sw = System.IO.File.AppendText("D:\\visitors.log"))
            {
                sw.WriteLine(DateTime.UtcNow.ToString() + "\t" + visitor);
            }
            return View();
        }

        //public List<string> selRuby(string ruby)
        //{
        //    nomime_con.Open();
        //    var cubo = new List<string> { };
        //    string sql = "select word from " + opttable + " where " + optruby + " = '" + ruby + "' " + optlev + " order by level desc";
        //    SQLiteCommand command = new SQLiteCommand(sql, nomime_con);
        //    SQLiteDataReader reader = command.ExecuteReader();
        //    while (reader.Read())
        //    {
        //        cubo.Add(reader["word"].ToString());
        //    }
        //    return cubo;
        //}

        //public JsonResult TypeWord(string ruby)
        //{
        //    JsonResult json = null;
        //    var listWord = new List<string> { };

        //    listWord.AddRange(selRuby(ruby));

        //    json = Json(listWord.ToList(), JsonRequestBehavior.AllowGet); ;
        //    return json;
        //}
    }
}