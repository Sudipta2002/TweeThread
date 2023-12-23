
async function RightSidebar() {
  
 
  return (
    <section className='custom-scrollbar rightsidebar max-md:hidden border-l border-l-dark-4 bg-dark-2'>
      <div className='flex flex-1 flex-col justify-start'>
        <h3 className='text-heading4-medium text-light-1'>
          Suggested Communities
        </h3>
      </div>
      <div className='flex flex-1 flex-col justify-start'>
        <h3 className='text-heading4-medium text-light-1'>
          Suggested Users
        </h3>
      </div>

    </section>
  );
}

export default RightSidebar;