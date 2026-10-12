// Invoke before the EXISTING Worker's router. Keep all existing routes intact.
// Check existing aliases for conflicts before enabling this in production.
const aliases = new Set(['/wsparcie','/misja','/pomoc','/darowizna','/partnerzy','/donate']);
export async function handleSupportRoute(request, env) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/$/,'');
  if (aliases.has(path) || url.pathname === '/wspieraj/' || url.pathname === '/wspieraj.html') {
    url.pathname = '/wspieraj';
    return new Response(null,{status:301,headers:{Location:url.href}});
  }
  if (url.pathname === '/wspieraj') {
    const assetUrl = new URL(request.url);
    assetUrl.pathname = '/wspieraj.html';
    // env.ASSETS must be the existing static-assets binding, not the Worker fetch.
    return env.ASSETS.fetch(new Request(assetUrl,request));
  }
  return null;
}
