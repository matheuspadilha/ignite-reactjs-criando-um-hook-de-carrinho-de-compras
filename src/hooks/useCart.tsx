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
      const stockInfo: Stock = await api.get(`stock/${productId}`)
          .then(response => response.data);

      if (stockInfo.amount > 0) {
        const product: Product = await api.get(`products/${productId}`)
            .then(response => response.data);

        setCart([...cart, product]);
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart));
      } else {
        console.log("Nao possui stock");
      }
    } catch {
      // TODO
    }
  };

  const removeProduct = (productId: number) => {
    try {
      let existsInTheCart = cart.find(product => (product.id === productId));

      if (existsInTheCart) {
        const products: Product[] = cart.filter( product => product.id !== productId ?? product );

        setCart(products);
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart));
      } else {
        console.log("Produto não esta no carrinho");
      }
    } catch {
      // TODO
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
