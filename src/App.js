import { Form, Button, Input } from 'antd'
import './App.css';
import "antd/dist/antd.css";
function App() {
  const [form] = Form.useForm();
  const generateReg = async () => {
    // const values = await form.validateFields()
    // const { sourceString, targetString} = values
    alert('啥也没干')
  }
  return (
    <div className="App">
      <div className="header">正则生成系统</div>
      <div className="content">
        <Form layout="inline" className="content-form" form={form}>
          <Form.Item 
            label="源字符串" 
            name="sourceString"
            rules={[
              {
                required: true,
                message: '请输入源字符串',
              },
            ]}
          >
            <Input placeholder="请输入源字符串"/>
          </Form.Item>
          <Form.Item 
            label="目标字符串" 
            name="targetString"
            rules={[
              {
                required: true,
                message: '请输入目标字符串',
              },
            ]}
          >
            <Input placeholder="请输入目标字符串"/>
          </Form.Item>
          <Form.Item>
            <Button type="primary" onClick={generateReg}>生成</Button>
          </Form.Item>
        </Form>
        <div className="content-box"></div>
      </div>
      <div className="footer">@hill-xu</div>
    </div>
  );
}

export default App;
