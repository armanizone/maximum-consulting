import axios from "axios";
import React from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

async function getTransactions () {
  return await axios.get(`${import.meta.env.VITE_APP_SERVER_URL}/transactions`)
}

function App() {

  const [transaction, setTransaction] = React.useState({
    dateTime: new Date(),
    sum: "",
    category: "",
    comment: "",
  });

  const [transactions, setTransactions] = React.useState({})

  async function handleTransactions () {
    await getTransactions()
    .then(res => {
      setTransactions(res)
    })
  }

  React.useEffect(() => {
    handleTransactions()
  }, [])

  function handleInputChange (e) {
    const { value, name } = e.target
    setTransaction({...transaction, [name]: value})
  }

  const options = ["Продукты", "Для себя", "Событие", "Прочее"];

  async function addTransaction (e) {
    e.preventDefault();
    axios.post(`${import.meta.env.VITE_APP_SERVER_URL}/transactions`, {
      ...transaction,
      sum: Number(transaction.sum),
      author: 'User'
    })
    .then(res => {
      setTransaction({})
      alert('Расход успешно добавлен')
      handleTransactions()
    })
    .catch(err => {
      throw new Error(err)
    })
  }

  async function deleteTransaction (id) {
    axios.delete(`${import.meta.env.VITE_APP_SERVER_URL}/transactions/${id}`)
    .then(res => {
      alert('Расход успешно удален')
      handleTransactions()
    })
    .catch(err => {
      throw new Error(err)
    })
  }


  return (
    <div className="container">
      <form
        className="max-w-fit mx-auto flex flex-col space-y-4 border shadow-md p-4 mt-8"
        onSubmit={addTransaction}
      >
        <h1 className="text-center text-xl">Добавление расхода</h1>

        <label htmlFor="calendar" className="mt-2">Дата:</label>
        <Calendar 
          locale="ru" 
          value={transaction?.dateTime ?? ''} 
          onChange={e => setTransaction({...transaction, dateTime: e})} 
        />

        <div className="grid grid-cols-[30%_auto]">
          <label htmlFor="sum">Сумма:</label>
          <input 
            name="sum" 
            id="sum" 
            className="border-2 p-2" 
            type="number" 
            value={transaction?.sum ?? ''}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="grid grid-cols-[30%_auto]">
          <label htmlFor="category">Категория:</label>
          <select 
            name="category" 
            id="category" 
            className="p-2 border-2"
            value={transaction?.category ?? ''}
            onChange={handleInputChange}
            required
          >
            <option value={"Не выбрано"}>--Выберите категорию--</option>
            {options.map((q, i) => {
              return (
                <option value={q} key={i}>
                  {q}
                </option>
              );
            })}
          </select>
        </div>

        <div className="grid grid-cols-[30%_auto]">
          <label htmlFor="comment">Комметарий:</label>
          <textarea 
            name="comment" 
            id="comment" 
            className="border-2 p-2" 
            value={transaction?.comment ?? ''}
            onChange={handleInputChange}
            required
          />
        </div>

        <button type="submit">Добавить расход</button>
      </form>
      
      <h2 className="text-center mt-8 text-xl mb-4">Расходы </h2>
      {transactions?.data?.length !== 0 && (
        <table className="mx-auto border shadow-md " cellSpacing={4}>
          <tr>
            <th className="p-2">ID</th>
            <th className="p-2">Дата</th>
            <th className="p-2">Сумма</th>
            <th className="p-2">Автор</th>
            <th className="p-2">Категория</th>
            <th className="p-2">Комментарий</th>
            <th className="p-2">Действие</th>
          </tr>
          {transactions?.data?.map((q, i) => {
            return (
              <tr key={i}>
                <td className="p-2">{q?.id}</td>
                <td className="p-2">{q?.dateTime}</td>
                <td className="p-2">{q?.sum}</td>
                <td className="p-2">{q?.author}</td>
                <td className="p-2">{q?.category}</td>
                <td className="p-2">{q?.comment}</td>
                <td className="p-2">
                  <button onClick={() => deleteTransaction(q?.id)}>
                    Удалить
                  </button>
                </td>
              </tr>
            )
          })}
        </table>
      )}
    </div>
  );
}

export default App;
