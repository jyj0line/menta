import { type Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const tMetadata = await getTranslations('metadata');
  const tPageMy = await getTranslations('page.my');
  
  return {
    title: tPageMy('title'),
    description: tPageMy('description', { applicationName: tMetadata('applicationName')})
  };
}

const MyPage = () => {
  return (
    <main className='flex flex-col items-center min-h-full p-page-p16'>
    </main>
  )
}
export default MyPage;