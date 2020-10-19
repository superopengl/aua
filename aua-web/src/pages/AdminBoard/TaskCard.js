import { Modal, Space, Card } from 'antd';
import Text from 'antd/lib/typography/Text';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { deleteTask } from '../../services/taskService';
import styled from 'styled-components';
import { Draggable } from 'react-beautiful-dnd';
import { PortfolioAvatar } from 'components/PortfolioAvatar';
import PropTypes from 'prop-types';

const StyledCard = styled(Card)`
position: relative;
box-shadow: 0 1px 2px rgba(0,0,0,0.1);
.ant-card-body {
  padding: 16px;
}
`;

const TaskCard = (props) => {

  const { task, index, onChange } = props;
  const { id, name, forWhom, email, taskTemplateName } = task;

  const getItemStyle = (isDragging, draggableStyle) => ({
    // background: isDragging ? "#C0C0C0" : "",
    ...draggableStyle
  });


  const handleEditTask = (id) => {
    props.history.push(`/tasks/${id}/proceed`);
  }

  return <Draggable draggableId={id} index={index}>
    {
      (provided, snapshot) => (
        <div ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}>
          <StyledCard hoverable onDoubleClick={() => handleEditTask(id)}>
            <Space direction="vertical" style={{ width: '100%' }}>
              {name}
              <Text type="secondary">{taskTemplateName}</Text>
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Space style={{ lineHeight: '0.5rem', padding: 0 }}>
                  <PortfolioAvatar value={forWhom} id={task.portfolioId} size={32} />
                  <Space direction="vertical">
                    <small>{forWhom}</small>
                    <small>{email}</small>
                  </Space>
                </Space>
              </Space>
            </Space>
            {/* <div style={{ display: 'flex', position: 'absolute', right: 0, bottom: 0 }}>
              <Tooltip placement="bottom" title="Proceed task">
                <Link to={`/tasks/${id}/proceed`}><Button type="link" icon={<EditOutlined />}></Button></Link>
              </Tooltip>
              <Tooltip placement="bottom" title="Delete task">
                <Button type="link" danger onClick={handleDelete} icon={<DeleteOutlined />}></Button>
              </Tooltip>
            </div> */}
          </StyledCard>
        </div>
      )
    }
  </Draggable>
}

TaskCard.propTypes = {
  task: PropTypes.any.isRequired
};

TaskCard.defaultProps = {};

export default withRouter(TaskCard);