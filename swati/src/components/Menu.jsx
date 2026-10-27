// Menu section on the home page ("Our Menu").
// Shows dishes from assets.js. Clicking a dish opens ItemModel (a popup with details).
// State: selectedItem (dish shown in the popup), isModelOpen (popup open or not).

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { foodMenu } from '../assets/fork-flame-static (11)/assets'
import ItemModel from '../components/ItemModel'


const Menu = () => {
    const [selectedItem, setSelectedItem] = useState(null);
    const [isModelOpen, setIsModelOpen] = useState(false);


    const openModel =(item)=>{
        setSelectedItem(item);
        setIsModelOpen(true);
    }


    const closeIsModel =()=>{
        setSelectedItem(null);
        setIsModelOpen(false);
    }
  return (
    <div id='menu' className='bg-secondary py-20'>
        <div className='container mx-auto px-6'>
            <div className='text-center'> 
                <h1 className='text-3xl  text-dark font-bold mb-6'>
                    Our Menu</h1>
                <div className='w-20 h-1 bg-primary mx-auto mb-4'></div>
                <p className='text-gray-700 mb-4'>crafted with passion and the finest ingredients</p>

            </div>
            <div className='max-w-4xl mx-auto'>

                <div className='grid grid-cols-1 md:grid-cols-3 gap-12'>
                    {
                        foodMenu.map((food) => (
                                 <div onClick={()=> openModel(food)} key={food.id} className='group overflow-hidden rounded-lg bg-white shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl'>
                                     <div className='overflow-hidden'>
                                          <img className='w-full h-96 object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none' src={food.image} alt={food.title} />
                                     </div>
                                     <div className='p-4'>
                                <h2 className='text-xl text-dark font-bold '>{food.title}</h2>
                                <span className='text-sm text-primary font-bold'>{food.price}</span>

                            </div>
                            <p className=' text-sm text-gray-700'>{food.ingredients}</p>

                         </div>

                       
                    
                    
                        ))

                    }

                </div>
                {/*model*/}
                <ItemModel  isOpen={isModelOpen} onClose={closeIsModel}
                item={selectedItem}/>
                <div className='text-center'>
                    <Link to='/restaurants' className='inline-block bg-primary px-8 py-3 rounded-full mt-12
                    text-white cursor-pointer'>View Full Menu & Order Online</Link>


                </div>

          </div>

        </div>
      
    </div>
  )
}

export default Menu
