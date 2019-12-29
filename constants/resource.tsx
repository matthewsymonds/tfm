export enum Resource {
  STEEL,
  TITANIUM,
  CARD,
  PLANT,
  ENERGY,
  HEAT,
  BACTERIA,
  PET,
  FLOATER,
  SCIENCE
}

export const getResourceSymbol = resource => {
  switch (resource) {
    case Resource.BACTERIA:
      return '🐛';
    case Resource.CARD:
      return '🌎';
    case Resource.ENERGY:
      return '⚡';
    case Resource.FLOATER:
      return '☁️';
    case Resource.HEAT:
      return '🔥';
    case Resource.PET:
      return '🐶';
    case Resource.PLANT:
      return '🍂';
    case Resource.SCIENCE:
      return '⚛️';
    case Resource.STEEL:
      return '🔨';
    case Resource.TITANIUM:
      return '☆';
  }
};

export const getResourceColor = resource => {
  switch (resource) {
    case Resource.BACTERIA:
      return 'green';
    case Resource.CARD:
      return 'orange';
    case Resource.ENERGY:
      return 'white';
    case Resource.FLOATER:
      return 'gray';
    case Resource.HEAT:
      return 'gold';
    case Resource.PET:
      return 'brown';
    case Resource.PLANT:
      return 'darkgreen';
    case Resource.SCIENCE:
      return 'white';
    case Resource.STEEL:
      return 'brown';
    case Resource.TITANIUM:
      return 'yellow';
  }
};

export const getResourceBackgroundColor = resource => {
  switch (resource) {
    case Resource.BACTERIA:
      return 'white';
    case Resource.CARD:
      return 'black';
    case Resource.ENERGY:
      return 'purple';
    case Resource.FLOATER:
      return 'red';
    case Resource.HEAT:
      return 'orange';
    case Resource.PET:
      return 'brown';
    case Resource.PLANT:
      return 'lightgreen';
    case Resource.SCIENCE:
      return 'darkgray';
    case Resource.STEEL:
      return '#EBA980';
    case Resource.TITANIUM:
      return 'black';
  }
};
