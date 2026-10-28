import type {homepage} from '@/data/homepage';
import type {content} from '@/data/content';
import type {testimonials} from '@/data/ui';
export type Pair={ka:string;en:string};
export type PublicSettings={companyName:string;phone:string;telephoneHref:string;email:string;address:string;facebook:string;instagram:string;logo:string;symbolLogo:string;copy:typeof content.ka};
export type PublicShell={settings:PublicSettings;sections:typeof homepage;testimonialsCopy:typeof testimonials.ka;previewNotice:string};
export type PublicSlide={id:number;title:string;description:string;image:string;buttonText:string;buttonURL:string};
export type PublicTestimonial={id:number;title:string;position:string;quote:string;portrait:string};
export type PublicCounter={id:number;title:string;value:number;suffix:string};
