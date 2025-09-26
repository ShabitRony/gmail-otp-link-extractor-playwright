

export function generateRandomUser() {
  return {
    email: `shabit.alahi+${generateRandomId(100,999)}@vivasoftltd.com`,
    password: "Sa@1234",
 
  };
}


  export const generateRandomId =(min,max)=>{
    let randomId = Math.random()*(max-min)+min;
    return parseInt(randomId);
}
