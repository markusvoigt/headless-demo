import { gql, GraphQLClient } from "graphql-request";
import ProductCard from "../components/ProductCard";
import Hero from "../components/Hero";
import { groq } from "next-sanity";
import { getClient } from "../lib/sanity";

export async function getStaticProps() {
  const graphQLClient = new GraphQLClient(process.env.NEXT_PUBLIC_SHOPIFY_URL, {
    headers: {
      "X-Shopify-Storefront-Access-Token": process.env.NEXT_PUBLIC_TOKEN,
    },
  });

  const heroQuery = groq`*[_type == "hero"]{
    heroTitle,
    heroSubtitle,
    "heroImage": heroImage.asset->url
  }[0]`;

  const heroData = await getClient().fetch(heroQuery, {});

  const query = gql`
    {
      collectionByHandle(handle: "headless") {
        id
        title
        products(first: 6) {
          edges {
            node {
              id
              title
              variants(first: 1) {
                edges {
                  node {
                    id
                    price
                  }
                }
              }
              images(first: 1) {
                edges {
                  node {
                    altText
                    transformedSrc
                  }
                }
              }
            }
          }
        }
      }
    }
  `;
  const res = await graphQLClient.request(query);

  if (res.errors) {
    console.log(JSON.stringify(res.errors, null, 2));
    throw new Error("Error accessing Shopify products");
  }

  return {
    props: {
      data: {
        heroData,
        collection: res.collectionByHandle,
      },
    },
  };
}

export default function Home({ data }) {
  const { heroData, collection } = data;

  return (
    <div>
      <section className="bg-white dark:bg-gray-900">
        <Hero heroData={heroData} />
      </section>
      <div className="bg-white">
        <div
          id="shop"
          className="max-w-2xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:max-w-7xl lg:px-8"
        >
          <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">
            Shop our unique branded apparel
          </h2>

          <div className="mt-6 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
            {collection.products.edges.map((product) => {
              return <ProductCard key={product.node.id} product={product} />;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
