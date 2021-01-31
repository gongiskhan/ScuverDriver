import React from 'react';
import {Button, Card, Paragraph, Text} from 'react-native-paper';
import {
  Alert,
  AppState,
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import {Order} from '../model/order';
import {showLocation} from 'react-native-map-link';
import moment from 'moment';
import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';

const styles = StyleSheet.create({
  scrollView: {
    textAlign: 'center',
    padding: '2%',
  },
  button: {
    marginLeft: 'auto',
    // position: 'absolute',
    // right: 0,
    // height: 300,
    // marginBottom: '5%',
  },
  card: {
    margin: '1%',
  },
  label: {
    fontWeight: 'bold',
  },
  value: {},
  stateDisabled: {
    color: '#919090',
  },
  stateEnabled: {
    color: '#6dbc28',
  },
  link: {
    color: '#50959d',
  },
  para: {
    marginBottom: '2%',
  },
  atm: {
    fontSize: 20,
    color: '#c83333',
  },
  paid: {
    fontSize: 20,
    color: '#6dbc28',
  },
});

const states = {
  completed: 'Entregue',
  pending: 'Pendente',
  viewed: 'Em Preparação',
  sent: 'Pronta para Entrega',
  ready: 'Pronta para Entrega',
  assigned: 'A Recolher',
  bringing: 'A Entregar',
  delivered: 'Entregue',
};

export default class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      orders: [],
      user: null,
      viewedOrders: 0,
      preparedOrders: 0,
      deliveringOrder: null,
      latitude: 0,
      longitude: 0,
      appState: AppState.currentState,
    };

    //firebase.database().settings({experimentalForceLongPolling: true});
  }

  componentDidMount() {
    this._unsubscribe = this.props.navigation.addListener('focus', () => {
      this.getCurrentUser();
    });
    this.getCurrentUser();
    AsyncStorage.getItem('visited').then((visited) => {
      if (!visited) {
        AsyncStorage.setItem('visited', 'true').then(() => {
          this.forceUpdate();
        });
      }
    });
    AppState.addEventListener('change', this._handleAppStateChange);
  }

  componentWillUnmount() {
    this._unsubscribe();
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  _handleAppStateChange = (nextAppState) => {
    console.log('nextAppState', nextAppState);
    if (
      this.state.appState.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      console.log('App came to foreground. Updating orders.');
      firestore()
        .collection('orders')
        .get()
        .then((results) => this.updateOrders(results));
    }
    this.setState({appState: nextAppState});
  };

  getCurrentUser() {
    const self = this;
    AsyncStorage.getItem('user').then((u: any) => {
      console.log('u from local storage', u);
      const authUser = u && JSON.parse(u).user;
      if (authUser) {
        console.log('authUser.email', authUser.email);
        const dbRef = firestore().collection('user');
        dbRef
          .where('email', '==', authUser.email.toLowerCase().trim())
          .get()
          .then((u) => {
            const fU = u.docs[0] && u.docs[0].data();
            if (fU) {
              this.setState(
                {
                  user: fU,
                  latitude: fU.address.coordinates.O,
                  longitude: fU.address.coordinates.F,
                },
                () => {
                  this.startLocating.bind(self)();
                  this.initMessaging.bind(self)();
                  this.subscribeOrders.bind(self)();
                },
              );
            } else {
              Alert.alert('Info', 'Por favor efetue o login.', null, {
                cancelable: true,
              });
            }
          });
      } else {
        Alert.alert('Info', 'Por favor efetue o login.', null, {
          cancelable: true,
        });
        this.props.navigation.navigate('Login');
      }
    });
  }

  initMessaging() {
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('Message handled in the background!', remoteMessage);
    });
    messaging().onMessage(async (remoteMessage) => {
      // Alert.alert(
      //   remoteMessage.notification.title,
      //   remoteMessage.notification.body,
      // );
    });

    AsyncStorage.getItem('fcm_token').then((u: any) => {
      console.log('u', u);
      if (!u) {
        console.log('Getting Firebase Token');
        messaging()
          .getToken()
          .then((fcmToken) => {
            if (fcmToken) {
              console.log('Your Firebase Token is:', fcmToken);
              AsyncStorage.setItem('fcm_token', fcmToken);
              let tks = this.state.user.fcmTokens;
              if (!tks) {
                tks = [];
              }
              tks.push(fcmToken);
              firestore().collection('user').doc(this.state.user.key).update({
                fcmTokens: tks,
              });
            } else {
              console.log('Failed', 'No token received');
            }
          });
      }
    });
  }

  startLocating() {
    // This handler fires whenever bgGeo receives a location update.
    BackgroundGeolocation.onLocation(this.onLocation.bind(this), this.onError);

    BackgroundGeolocation.onProviderChange((event) => {
      console.log('[onProviderChange: ', event);

      switch (event.status) {
        case BackgroundGeolocation.AUTHORIZATION_STATUS_DENIED:
          // Android & iOS
          console.log('- Location authorization denied');
          break;
        case BackgroundGeolocation.AUTHORIZATION_STATUS_ALWAYS:
          // Android & iOS
          console.log('- Location always granted');
          break;
        case BackgroundGeolocation.AUTHORIZATION_STATUS_WHEN_IN_USE:
          // iOS only
          console.log('- Location WhenInUse granted');
          break;
      }
    });

    BackgroundGeolocation.ready(
      {
        // Geolocation Config
        desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_NAVIGATION,
        distanceFilter: 50,
        authorization: 'Always',
        // Activity Recognition
        stopTimeout: 1,
        // Application config
        debug: false, // <-- enable this hear sounds for background-geolocation life-cycle.
        logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
        stopOnTerminate: true, // <-- Allow the background-service to continue tracking when user closes the app.
        startOnBoot: false, // <-- Auto start tracking when device is powered-up.
        // HTTP / SQLite config
        // url: 'http://yourserver.com/locations',
        // batchSync: false,       // <-- [Default: false] Set true to sync locations to server in a single HTTP request.
        // autoSync: true,         // <-- [Default: true] Set true to sync each location to server as it arrives.
        // headers: {              // <-- Optional HTTP headers
        //   "X-FOO": "bar"
        // },
        // params: {               // <-- Optional HTTP params
        //   "auth_token": "maybe_your_server_authenticates_via_token_YES?"
        // }
      },
      (state) => {
        console.log(
          '- BackgroundGeolocation is configured and ready: ',
          state.enabled,
        );

        if (!state.enabled) {
          ////
          // 3. Start tracking!
          //
          BackgroundGeolocation.start(function () {
            console.log('- Start success');
          });
        }
      },
    );
  }

  onLocation(location) {
    if (location && this.state && this.state.user) {
      this.setState(
        {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        () => {
          console.log('this.state.user.email', this.state.user.email);

          const dbRef = firestore().collection('user');
          dbRef
            .where('email', '==', this.state.user.email.toLowerCase().trim())
            .get()
            .then((u) => {
              // console.log('UUUU', u);
              const dU = u.docs[0];
              // console.log('dU', dU);
              dU.ref.update({
                coordinates: [
                  location.coords.latitude,
                  location.coords.longitude,
                ],
              });
            });
        },
      );
    }
  }
  onError(error) {
    console.warn('[location] ERROR -', error);
  }

  openMap(lat, lng) {
    showLocation({
      latitude: lat,
      longitude: lng,
    });
  }

  openGoogleMaps(a) {
    let address = a.address;
    address += ' ';
    address += a.floor || '';
    address += ' ';
    address += a.doorNumber || '';
    address += ' ';
    address += a.postalCode || '';
    address += ' ';
    address += a.local || '';
    address = encodeURI(address);
    Linking.openURL(
      `https://www.google.com/maps/search/?api=1&query=${address}`,
    );
  }

  formatHours(date) {
    return moment(date).format('HH:mm');
  }

  getUpdatedOrder(order) {
    return new Promise((resolve) => {
      database()
        .ref('/order/' + order.key)
        .once('value', (result) => {
          resolve(result.val());
        });
    });
  }

  subscribeOrders() {
    // firebase.
    database()
      .ref('/order')
      .orderByChild('status')
      // .equalTo('completed')
      .on('value', (results) => {
        // console.log('User data: ', results.val());
        this.updateOrders(results);
      });
  }

  updateOrders(results) {
    const orders = [];
    let viewedOrders = 0;
    let preparedOrders = 0;
    let deliveringOrder = null;
    results.forEach((doc: DataSnapshot) => {
      const order: Order = doc.val();

      if (
        order.orderType === 'delivery' &&
        (order.status === 'viewed' ||
          order.status === 'sent' ||
          order.status === 'ready')
      ) {
        order.status === 'viewed' ? viewedOrders++ : preparedOrders++;
        orders.push(this.renderOrder(order));
      } else if (
        order.orderType === 'delivery' &&
        order.status === 'bringing' &&
        order.driver === this.state.user.email
      ) {
        deliveringOrder = order;
      }
    });
    this.setState({orders, viewedOrders, preparedOrders, deliveringOrder});
  }

  renderOrder(order: Order) {
    return (
      <Card key={order.key} style={styles.card}>
        <Card.Content>
          <Paragraph>
            <Text style={styles.label}>Estado: </Text>
            <Text
              style={
                order.status === 'ready' || order.status === 'sent'
                  ? styles.stateEnabled
                  : styles.stateDisabled
              }>
              {states[order.status || 'pending']}
            </Text>
          </Paragraph>
          <Paragraph>
            <Text style={styles.label}>Hora de Entrega (no cliente): </Text>
            <Text style={styles.value}>
              {this.formatHours(order.deliveryDate)}
            </Text>
          </Paragraph>
          <Paragraph>
            <Text style={styles.label}>Referência: </Text>
            <Text style={styles.value}>{order.reference}</Text>
          </Paragraph>
          <Paragraph>
            <Text style={styles.label}>Restaurante: </Text>
            <Text style={styles.value}>{order.restaurantName}</Text>
          </Paragraph>
          <Paragraph style={styles.para}>
            <Text style={styles.label}>Morada Restaurante: </Text>
            {'\n'}
            <Text
              style={order.restaurantAddress.address ? styles.link : null}
              onPress={() => this.openGoogleMaps(order.restaurantAddress)}>
              {(order.restaurantAddress.address || '') + ' '}
              {(order.restaurantAddress.doorNumber || '') + ' '}
              {(order.restaurantAddress.floor || '') + ' '}
              {(order.restaurantAddress.postalCode || '') + ' '}
              {order.restaurantAddress.local || ''}
            </Text>
          </Paragraph>
          {order.status === 'bringing' && (
            <>
              <Paragraph>
                <Text style={styles.label}>Cliente: </Text>
                <Text style={styles.value}>{order.userName}</Text>
              </Paragraph>
              <Paragraph>
                <Text style={styles.label}>Telefone: </Text>
                <Text style={styles.value}>{order.phoneNumber}</Text>
              </Paragraph>
              <Paragraph style={styles.para}>
                <Text style={styles.label}>Morada Cliente: </Text>
                {'\n'}
                <Text
                  style={order.address.address ? styles.link : null}
                  onPress={() => this.openGoogleMaps(order.address)}>
                  {(order.address.address || '') + ' '}
                  {(order.address.doorNumber || '') + ' '}
                  {(order.address.floor || '') + ' '}
                  {(order.address.postalCode || '') + ' '}
                  {order.address.local || ''}
                </Text>
              </Paragraph>
              <Paragraph>
                <Text style={styles.label}>Notas: </Text>
                <Text style={styles.value}>{order.notes}</Text>
              </Paragraph>
              <Paragraph>
                <Text style={styles.label}>Artigos: </Text>
                <Text style={styles.value}>
                  {order.items.map((o) => o.quantity + ' ' + o.name + '\n')}
                </Text>
              </Paragraph>
              <Paragraph>
                <Text style={styles.label}>Total: </Text>
                <Text style={styles.value}>{this.calculateCost(order)}</Text>
              </Paragraph>
            </>
          )}
          <Paragraph>
            <Text style={styles.label}>Estado Pagamento: </Text>
            <Text
              style={
                order.paymentMethod === 'atm' || order.paymentMethod === 'tpa'
                  ? styles.atm
                  : styles.paid
              }>
              {order.paymentMethod === 'atm' || order.paymentMethod === 'tpa'
                ? 'TPA'
                : 'PAGO'}
            </Text>
          </Paragraph>
        </Card.Content>
        <Card.Actions>
          {(order.status === 'sent' || order.status === 'ready') && (
            <Button
              style={styles.button}
              mode={'contained'}
              onPress={() => this.bringing(order)}>
              Aceitar
            </Button>
          )}
          {order.status === 'bringing' && (
            <Button
              style={styles.button}
              mode={'contained'}
              onPress={() => this.complete(order)}>
              Entregue
            </Button>
          )}
        </Card.Actions>
      </Card>
    );
  }

  bringing(order: Order) {
    this.getUpdatedOrder(order).then((o) => {
      if (order.status === 'sent' || order.status === 'ready') {
        if (
          (order.paymentMethod !== 'tpa' && order.paymentMethod !== 'atm') ||
          ((order.paymentMethod === 'tpa' || order.paymentMethod === 'atm') &&
            this.state.user.tpa)
        ) {
          if (this.orderWithinDistance(order)) {
            Alert.alert(
              'Aceitar Encomenda',
              'Tem a certeza que quer aceitar esta encomenda? Deve garantir que consegue estar no estabelecimento dentro de 10 minutos.',
              [
                {
                  text: 'Não',
                  onPress: () => console.log('Encomenda não aceite.'),
                  style: 'cancel',
                },
                {
                  text: 'Sim',
                  onPress: () => {
                    database()
                      .ref('/order/' + order.key)
                      .update({
                        status: 'bringing',
                        driver: this.state.user.email,
                        acceptedAt: new Date(),
                      });
                    this.setState({
                      deliveringOrder: {...order, status: 'bringing'},
                    });
                  },
                },
              ],
              {cancelable: false},
            );
          } else {
            Alert.alert(
              'Info',
              `Não está dentro do raio de entrega. Por favor verifique se a distância do restaurante é inferior a ${
                this.state.user.realDeliveryRadius || 3
              }km e nesse caso informe-nos por favor.`,
            );
          }
        } else {
          Alert.alert(
            'Info',
            'Esta encomenda necessita TPA. Só estafetas com o terminal multibanco poderão aceitar.',
          );
        }
      } else {
        Alert.alert('Info', 'Entrega já não está disponível.');
      }
    });
  }

  complete(order: Order) {
    let message = 'Confirma que entregou a encomenda?';
    if (order.paymentMethod === 'atm' || order.paymentMethod === 'tpa') {
      message +=
        '\n\nEsta encomenda deve ser cobrada por cartão multibanco ou no caso de não ter TPA deve informar o cliente que entraremos em contacto mais tarde.';
    }
    Alert.alert(
      'Completar Encomenda',
      message,
      [
        {
          text: 'Não',
          onPress: () => console.log('Encomenda não entregue.'),
          style: 'cancel',
        },
        {
          text: 'Sim',
          onPress: () => {
            database()
              .ref('/order/' + order.key)
              .update({status: 'delivered', deliveredAt: new Date()});
            this.setState({
              deliveringOrder: null,
            });
          },
        },
      ],
      {cancelable: false},
    );
  }

  orderWithinDistance(order: Order) {
    if (
      order.restaurantAddress &&
      order.restaurantAddress.coordinates &&
      order.restaurantAddress.coordinates.latitude
    ) {
      const driverRadius =
        (this.state.user && this.state.user.realDeliveryRadius) || 3;
      console.log('driverRadius', driverRadius);
      const distance = this.haversineDistance(
        order.restaurantAddress.coordinates.latitude,
        order.restaurantAddress.coordinates.longitude,
      );
      console.log('distance', distance);
      const isWhithinRadius = distance < driverRadius;
      console.log('isWhithinRadius', isWhithinRadius);
      return isWhithinRadius;
    }
  }

  calculateCost(order) {
    let cost =
      order.total ||
      order.subTotal +
        (order.deliveryFee === 0
          ? 0
          : order.deliveryFee
          ? order.deliveryFee
          : 1.75);
    if (order.promotion && !order.promotion.used) {
      cost -= order.promotion.amount;
    }
    return cost;
  }

  haversineDistance(destLat, destLng) {
    const toRadian = (angle) => (Math.PI / 180) * angle;
    const distance = (a, b) => (Math.PI / 180) * (a - b);
    const RADIUS_OF_EARTH_IN_KM = 6371;

    const dLat = distance(this.state.latitude, destLat);
    const dLon = distance(this.state.longitude, destLng);

    const lat1 = toRadian(this.state.latitude);
    const lat2 = toRadian(destLat);

    // Haversine Formula
    const a =
      Math.pow(Math.sin(dLat / 2), 2) +
      Math.pow(Math.sin(dLon / 2), 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.asin(Math.sqrt(a));

    return RADIUS_OF_EARTH_IN_KM * c;
  }

  render() {
    return (
      <SafeAreaView>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={styles.scrollView}>
          {this.state && !this.state.deliveringOrder && (
            <>
              <Paragraph>
                <Text style={styles.label}>Encomendas em Preparação: </Text>
                <Text style={styles.value}>
                  {this.state && this.state.viewedOrders}
                </Text>
              </Paragraph>
              <Paragraph>
                <Text style={styles.label}>Encomendas para Entrega: </Text>
                <Text style={styles.value}>
                  {this.state && this.state.preparedOrders}
                </Text>
              </Paragraph>
            </>
          )}
          {this.state && this.state.deliveringOrder
            ? this.renderOrder(this.state.deliveringOrder)
            : this.state.orders}
        </ScrollView>
      </SafeAreaView>
    );
  }
}
