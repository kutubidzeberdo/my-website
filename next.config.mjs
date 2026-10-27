import { withPayload } from '@payloadcms/next/withPayload';
const adminHeaders=[
  {key:'X-Content-Type-Options',value:'nosniff'},
  {key:'X-Frame-Options',value:'DENY'},
  {key:'Referrer-Policy',value:'strict-origin-when-cross-origin'},
];
export default withPayload({
  async headers(){return [
    {source:'/admin/:path*',headers:adminHeaders},
    {source:'/api/users/:path*',headers:adminHeaders},
    {source:'/api/media/:path*',headers:[{key:'X-Content-Type-Options',value:'nosniff'}]},
  ];},
});
