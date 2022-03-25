import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const updateCart = [...cart];
      const existsProduct = updateCart.find(p => p.id === productId);

      const stockInfo: Stock = await api.get(`stock/${productId}`)
          .then(response => response.data);

      const currentAmount = existsProduct ? existsProduct.amount : 0;
      const amount = currentAmount + 1;

      if (amount > stockInfo.amount) {
        toast.error('Quantidade solicitada fora de estoque' );
        return;
      }

      if (existsProduct) {
        existsProduct.amount = amount;
      } else {
        const product: Product = await api.get(`products/${productId}`)
            .then(response => response.data);

        const newProduct = {
          ...product,
          amount: 1
        }

        updateCart.push(newProduct);
      }

      setCart(updateCart);
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart));
    } catch {
      toast.error('Erro na adição do produto' );
    }
  };

  const removeProduct = (productId: number) => {
    try {
      let existsInTheCart = cart.find( product => ( product.id === productId ) );

      if (existsInTheCart) {
        const products: Product[] = cart.filter( product => product.id !== productId ?? product );

        setCart(products);
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart));
      } else {
        toast.error('Erro na remoção do produto');
      }
    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
    } catch {
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      { children }
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext( CartContext );

  return context;
}
