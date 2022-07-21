import {useRouter} from 'next/router'
import React, { useState} from 'react'
import {gql, GraphQLClient} from 'graphql-request'

const ProductCard = ({product}) => {

    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function createCheckout(variantId){
        setLoading(true);
        const graphQLClient = new GraphQLClient(process.env.NEXT_PUBLIC_SHOPIFY_URL,{
            headers:{
              "X-Shopify-Storefront-Access-Token": process.env.NEXT_PUBLIC_TOKEN,
            }
          })
        const query = gql`
        mutation checkoutCreate($input: CheckoutCreateInput!) {
  checkoutCreate(input: $input) {
    checkout {
      id
      webUrl
    }
    checkoutUserErrors {
      code,
      field,
      message
    }
  }
}`

    const variables = {
            input: {
              lineItems: [
                {
                  quantity: 1,
                  variantId
                }
              ]
            }
    }

    const res = await graphQLClient.request(query, variables);
    setLoading(false);
    if (res.checkoutCreate.checkoutUserErrors.length > 0) {
        alert("There was an error creating the checkout")
    }else{
        router.push(res.checkoutCreate.checkout.webUrl);
    }

}

  return (
    <div className="group relative">
          <div className="w-full min-h-80 bg-gray-200 aspect-w-1 aspect-h-1 rounded-md overflow-hidden group-hover:opacity-75 lg:h-80 lg:aspect-none">
            <img
              src={product.node.images.edges[0].node.transformedSrc}
              alt={product.node.images.edges[0].node.altText}
              className="w-full h-full object-center object-cover lg:w-full lg:h-full"
            />
          </div>
          <div className="mt-4 flex justify-between">
            <div>
              <h3 className="text-sm text-gray-700">
                    {product.node.title}
              </h3>
            </div>
            <p className="text-sm font-medium text-gray-900">{product.node.variants.edges[0].node.price} €</p>
            </div>
            <div className="font-medium">
            <button disabled={loading} onClick={() => createCheckout(product.node.variants.edges[0].node.id)} className={`bg-primary-700 hover:bg-primary-800 text-white md:text-lg lg_text-xl px-6 py-2 block mb-4 w-full ${ loading && "opacity-70 curser-not-allowed"}`}>Buy now</button>
            </div>
        </div>
  )
}

export default ProductCard