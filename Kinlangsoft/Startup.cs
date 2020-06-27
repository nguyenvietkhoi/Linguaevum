using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(Linguaevum.Startup))]
namespace Linguaevum
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
