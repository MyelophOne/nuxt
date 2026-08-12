export default defineNitroPlugin((nitro) => {
	nitro.hooks.hook('render:html', (html) => {
		html.head.unshift(
			'<style>body,img{overflow-x:hidden;max-width:100%}html,body,#__nuxt{margin:0;padding:0;width:100%;font-family:-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen,Ubuntu,"Helvetica Neue",Arial,sans-serif,color-emoji}body,#__nuxt{min-height:100dvh;}html{height:auto;font-size:15px;-webkit-text-size-adjust:100%;text-size-adjust:100%}body{min-height:100dvh;font-size:1rem;position:relative}@media screen and (min-width:768px){html{font-size:16px}}@media screen and (min-width:1500px){html{font-size:17px}}@media screen and (min-width:1920px){html{font-size:18px}}@media screen and (min-width:2560px){html{font-size:20px}}@media screen and (max-height:650px){html{font-size:15px}}@media screen and (max-height:480px){html{font-size:14px}}</style>',
		);
	});
});
