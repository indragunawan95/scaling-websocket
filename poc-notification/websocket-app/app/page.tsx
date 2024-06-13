import NotificationBell from './components/NotificationBell';
import SendNotificationButton from './components/SendNotificationButton';

const Home: React.FC = () => {
  return (
    <div>
      <NotificationBell />
      <SendNotificationButton />
    </div>
  );
};

export default Home;
