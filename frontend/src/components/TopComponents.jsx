import React, { useEffect, useState } from 'react';
import { useGetCollarsQuery } from '../redux/api/collarApiSlice';
import Title from './Title';
import ProductItem from './ProductItem';

const TopComponents = () => {
  const { data: collars, isLoading, error } = useGetCollarsQuery();
  const [topComponents, setTopComponents] = useState([]);
  
  useEffect(() => {
    if (collars) {
      // Extract all components from all collars
      const allComponents = [];
      collars.forEach(collar => {
        if (collar.compatibleComponents && collar.compatibleComponents.length > 0) {
          collar.compatibleComponents.forEach(component => {
            // Add collar information to component for display
            allComponents.push({
              ...component,
              collarModel: collar.modelName
            });
          });
        }
      });
      
      // Sort by price or another criteria if needed
      const sortedComponents = allComponents.sort((a, b) => b.price - a.price);
      
      // Get top 10 components
      setTopComponents(sortedComponents.slice(0, 10));
    }
  }, [collars]);

  if (isLoading) return <div>Loading components...</div>;
  if (error) return <div>Error loading components: {error.message}</div>;

  return (
    <div className='my-10'>
      <div className='text-center py-8 text-3xl'>
        <Title text1={'FEATURED'} text2={'COMPONENTS'} />
        <p className='w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600'>
          Enhance your smart collar with our premium components. Upgrade functionality and personalize your pet's experience.
        </p>
      </div>

      {/* Rendering Components */}
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6'>
        {topComponents.length > 0 ? (
          topComponents.map((item, index) => (
            <ProductItem 
              key={index} 
              id={item._id} 
              image={item.image || '/placeholder-component.png'} 
              name={item.name} 
              price={item.price}
              subtitle={`For ${item.collarModel}`}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            No components available at this time.
          </div>
        )}
      </div>
    </div>
  );
};

export default TopComponents;