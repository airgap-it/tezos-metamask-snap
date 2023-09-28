let _isUiBusy = false;

export const isUiBusy = () => {
  return _isUiBusy;
};

export const setisUiBusy = (uiBusy: boolean) => {
  _isUiBusy = uiBusy;
};
