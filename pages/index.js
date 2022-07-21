import {gql, GraphQLClient} from 'graphql-request'
import ProductCard from '../components/ProductCard'
import { groq } from "next-sanity";
import { getClient } from "../lib/sanity";
import Image from "next/image"


export async function getStaticProps(){
  const graphQLClient = new GraphQLClient(process.env.NEXT_PUBLIC_SHOPIFY_URL,{
    headers:{
      "X-Shopify-Storefront-Access-Token": process.env.NEXT_PUBLIC_TOKEN,
    }
  })

  const heroQuery = groq`*[_type == "hero"]{
    heroTitle,
    heroSubtitle,
    "heroImage": heroImage.asset->url
  }[0]`;

  const heroData = await getClient().fetch(heroQuery,{});


  const query = gql`
  {
  collectionByHandle(handle: "headless"){
    id,
    title,
    products(first: 6){
      edges{
        node{
          id,
          title,
          variants(first:1){
            edges{
              node{
                id,
                price
              }
            }
          }
          images(first:1){
            edges{
              node{
                altText,
                transformedSrc
              }
            }
          }
        }
      }
    }
  }
}
  `
const res = await graphQLClient.request(query);

if (res.errors){
  console.log(JSON.stringify(res.errors, null, 2));
  throw new Error("Error accessing Shopify products");
}

return {
  props:{
    data:{
      heroData,
      collection: res.collectionByHandle,
    }
  }
}

}

export default function Home({data}) {

  const {heroData, collection} = data;
  
  return (
    <div>
    <section className="bg-white dark:bg-gray-900">
    <div className="grid max-w-screen-xl px-4 py-8 mx-auto lg:gap-8 xl:gap-0 lg:py-16 lg:grid-cols-12">
        <div className="mr-auto place-self-center lg:col-span-7">
            <h1 className="max-w-2xl mb-4 text-4xl font-extrabold tracking-tight leading-none md:text-5xl xl:text-6xl dark:text-white">{heroData.heroTitle}</h1>
            <p className="max-w-2xl mb-6 font-light text-gray-500 lg:mb-8 md:text-lg lg:text-xl dark:text-gray-400">{heroData.heroSubtitle}.</p>
            <a href="#shop" className="inline-flex items-center justify-center px-5 py-3 mr-3 text-base font-medium text-center text-white rounded-lg bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:focus:ring-primary-900">
                Shop now
                <svg className="w-5 h-5 ml-2 -mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
            </a>
        </div>
        <div className="hidden lg:mt-0 lg:col-span-5 lg:flex">
            <img src={heroData.heroImage} alt="mockup"/>
        </div>                
    </div>
</section>
<div className="bg-white">
      <div id="shop" className="max-w-2xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:max-w-7xl lg:px-8">
        <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">Shop our unique branded apparel</h2>

        <div className="mt-6 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
        {collection.products.edges.map((product) => {
         return <ProductCard key={product.node.id} product={product}/>
        })}
        </div>
      </div>
    </div>
</div>
  )
}