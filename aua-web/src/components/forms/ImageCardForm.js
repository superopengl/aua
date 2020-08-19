import React from 'react';
import PropTypes from 'prop-types';
import ImageUploader from 'components/inputs/ImageUploader';
import ImageVideoUploader from 'components/inputs/ImageVideoUploader';
import { Form, Input, InputNumber, Button, Checkbox } from 'antd';
import styled from 'styled-components';
import { LoadingOutlined } from '@ant-design/icons';
import RadioInput from 'components/inputs/RadioInput';
import { notify } from 'util/notify';

const FormButtonStyled = styled(Button)`
margin-bottom: 1rem;
`

// const EditModeContainer = styled.div`
// display: flex;
// flex-direction: column;
// align-items: center;
// margin: 0 auto;
// max-width: 600px;
// `

const Container = styled.div`
display: flex;
flex-direction: column;
align-items: center;
margin: 0 auto;
width: 100%;
`

export class ImageCardForm extends React.Component {

  constructor(props) {
    super(props);

    this.formRef = React.createRef();
    this.state = {
      id: this.props.id,
      loading: false
    }
  }

  static getDerivedStateFromProps(props, state) {
    return {
      ...state,
      id: props.id
    }
  }

  componentDidMount() {
    const { id } = this.state;
    if (id) {
      this.loadEntity(id);
    }
  }

  async loadEntity(id) {
    this.setState({ loading: true });
    try {
      const data = await this.props.onFetch(id);
      this.setState({ data });
    } finally {
      this.setState({ loading: false });
    }
  }

  onChange = async entity => {
    this.setState({ loading: true });
    try {
      // Assign id if exists
      Object.assign(entity, { id: this.state.id });
      await this.props.onSave(entity);
      notify.success('Successfully saved the picture');
    } finally {
      this.setState({ loading: false });
    }
  }

  onCancel = () => {
    this.props.onCancel();
    this.reset();
  }

  reset = () => {
    this.formRef.current.resetFields();
  }

  render() {
    const { fieldDefs } = this.props;
    const { loading, data } = this.state;

    return (
      <Container>
        {/* <em>this.state.id = {this.state.id}</em> */}
        {loading ?
          <LoadingOutlined style={{ fontSize: '5rem' }} /> :
          <Form ref={this.formRef} style={{ width: '100%' }} layout="vertical" onFinish={this.onChange} initialValues={data}>
            {fieldDefs.map((fieldDef, i) => {
              const { inputProps, type, ...field } = fieldDef;
              return <Form.Item key={i} {...field}>
                {type === 'imageVideoUploader' ? <ImageVideoUploader {...inputProps}/>
                : type === 'imageUploader' ? <ImageUploader {...inputProps} />
                  : type === 'number' ? <InputNumber type="number" pattern="\d*" {...inputProps} />
                    : type === 'textarea' ? <Input.TextArea {...inputProps} />
                      : type === 'enum' ? <RadioInput {...inputProps} />
                        : type === 'multi' ? <Checkbox.Group {...inputProps} />
                        : <Input {...inputProps} />
                }
              </Form.Item>
            })}
            <Form.Item>
              <FormButtonStyled htmlType="submit" type="primary" block>
                Save
            </FormButtonStyled>
              <FormButtonStyled type="link" block onClick={this.onCancel}>
                Cancel
            </FormButtonStyled>
            </Form.Item>
          </Form>
        }
      </Container>
    );
  }
}

ImageCardForm.propTypes = {
  id: PropTypes.string,
  onFetch: PropTypes.func,
  onSave: PropTypes.func.isRequired,
};

ImageCardForm.defaultProps = {};

export default ImageCardForm;