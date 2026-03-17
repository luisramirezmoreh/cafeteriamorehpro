import { useState, useEffect } from "react";
import { Settings, AlertTriangle } from "lucide-react";
import { Button } from "./components/ui/button";
import { SalesScreen } from "./components/SalesScreen";
import { AdminPanel } from "./components/AdminPanel";
import { LoginScreen } from "./components/LoginScreen";
import { OpenCafeteriaConfirmation } from "./components/OpenCafeteriaConfirmation";
import { MigrationHelper } from "./components/MigrationHelper";
import {
  Product,
  SaleItem,
  DailySale,
  StockGroup,
  ShiftRecord,
  CafeteriaState,
  ServiceUpgrade,
  ChapelName,
  BranchName,
  PaymentMethod,
  INITIAL_PRODUCTS,
  INITIAL_STOCK_GROUPS,
  BranchProductConfig,
  Branch,
  BRANCHES,
  DEFAULT_BRANCHES,
} from "./types/inventory";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import {
  syncProductsToSupabase,
  loadProductsFromSupabase,
  syncStockGroupsToSupabase,
  loadStockGroupsFromSupabase,
  syncSaleToSupabase,
  loadSalesFromSupabase,
  syncShiftToSupabase,
  loadShiftsFromSupabase,
  syncCafeteriaStateToSupabase,
  loadCafeteriaStateFromSupabase,
  syncConfigValueToSupabase,
  loadConfigValueFromSupabase,
  syncServiceUpgradesToSupabase,
  loadServiceUpgradesFromSupabase,
} from "../lib/supabase-sync";

const STORAGE_KEY_PRODUCTS = "cafeteria_products";
const STORAGE_KEY_STOCK_GROUPS = "cafeteria_stock_groups";
const STORAGE_KEY_SALES = "cafeteria_sales";
const STORAGE_KEY_SHIFTS = "cafeteria_shifts";
const STORAGE_KEY_CAFETERIA_STATE = "cafeteria_state";
const STORAGE_KEY_SCREENSAVER_VIDEO =
  "cafeteria_screensaver_video";
const STORAGE_KEY_SERVICE_UPGRADES =
  "cafeteria_service_upgrades";
const STORAGE_KEY_CURRENT_BRANCH = "cafeteria_current_branch";
const STORAGE_KEY_BRANCH_CONFIGS = "cafeteria_branch_configs";

function App() {
  const [view, setView] = useState<"sales" | "login" | "admin">(
    "sales",
  );
  const [currentBranch, setCurrentBranch] =
    useState<BranchName>("zapopan"); // Sucursal actual
  const [branches, setBranches] =
    useState<Branch[]>(DEFAULT_BRANCHES); // Sucursales disponibles
  const [products, setProducts] = useState<Product[]>([]);
  const [stockGroups, setStockGroups] = useState<StockGroup[]>(
    [],
  );
  const [sales, setSales] = useState<DailySale[]>([]);
  const [shifts, setShifts] = useState<ShiftRecord[]>([]);
  const [cafeteriaState, setCafeteriaState] =
    useState<CafeteriaState>({
      isOpen: false,
      initialMoney: 0,
    });
  const [showOpenConfirmation, setShowOpenConfirmation] =
    useState(false);
  const [screensaverVideoUrl, setScreensaverVideoUrl] =
    useState<string | null>(null);
  const [serviceUpgrades, setServiceUpgrades] = useState<
    ServiceUpgrade[]
  >([]);
  const [isLoadingFromSupabase, setIsLoadingFromSupabase] =
    useState(true);
  const [branchConfigs, setBranchConfigs] = useState<
    Record<BranchName, BranchProductConfig>
  >({
    zapopan: {
      branchId: "zapopan",
      disabledCategories: [],
      disabledProducts: [],
    },
    vallarta: {
      branchId: "vallarta",
      disabledCategories: ["capuchinos"],
      disabledProducts: [],
    },
    oblatos: {
      branchId: "oblatos",
      disabledCategories: ["capuchinos"],
      disabledProducts: [],
    },
  });

  useEffect(() => {
    // Cargar sucursal desde localStorage solo en el primer render
    const storedBranch = localStorage.getItem(
      STORAGE_KEY_CURRENT_BRANCH,
    ) as BranchName;
    if (storedBranch && !currentBranch) {
      setCurrentBranch(storedBranch);
    }
  }, []);

  useEffect(() => {
    // Cargar datos cuando cambie la sucursal
    loadInitialData();
  }, [currentBranch]);

  const loadInitialData = async () => {
    setIsLoadingFromSupabase(true);

    // Intentar cargar desde Supabase primero
    const supabaseProducts =
      await loadProductsFromSupabase(currentBranch);
    const supabaseStockGroups =
      await loadStockGroupsFromSupabase(currentBranch);
    const supabaseSales =
      await loadSalesFromSupabase(currentBranch);
    const supabaseShifts =
      await loadShiftsFromSupabase(currentBranch);
    const supabaseCafeteriaState =
      await loadCafeteriaStateFromSupabase(currentBranch);
    const supabaseVideoUrl = await loadConfigValueFromSupabase(
      "screensaver_video_url",
      currentBranch,
    );
    const supabaseServiceUpgrades =
      await loadServiceUpgradesFromSupabase(currentBranch);
    const supabaseBranchConfigs =
      await loadConfigValueFromSupabase(
        "branch_configs",
        currentBranch,
      );

    // Productos
    let loadedProducts: Product[] = [];
    if (supabaseProducts) {
      loadedProducts = supabaseProducts;
    } else {
      const storedProducts = localStorage.getItem(
        STORAGE_KEY_PRODUCTS,
      );
      if (storedProducts) {
        loadedProducts = JSON.parse(storedProducts);
      } else {
        loadedProducts = INITIAL_PRODUCTS;
      }
    }

    // MIGRACIÓN: Corregir stock de capuchinos si están en 0
    const needsMigration = loadedProducts.some(
      (p) => p.category === "capuchinos" && p.stock === 0,
    );

    if (needsMigration) {
      console.log("🔧 Migrando capuchinos con stock...");
      loadedProducts = loadedProducts.map((p) => {
        if (p.category === "capuchinos" && p.stock === 0) {
          return { ...p, stock: 100 };
        }
        return p;
      });
      // Guardar en ambos lados
      await syncProductsToSupabase(
        loadedProducts,
        currentBranch,
      );
      localStorage.setItem(
        STORAGE_KEY_PRODUCTS,
        JSON.stringify(loadedProducts),
      );
      toast.success("Stock de capuchinos actualizado", {
        icon: "☕",
        duration: 3000,
      });
    }

    // MIGRACIÓN: Agregar Tostitos y Fritos si no existen
    const hasTostitos = loadedProducts.some(
      (p) => p.id === "papitas-tostitos",
    );
    const hasFritos = loadedProducts.some(
      (p) => p.id === "papitas-fritos",
    );

    if (!hasTostitos || !hasFritos) {
      console.log(
        "🔧 Agregando nuevos productos: Tostitos y Fritos...",
      );

      // Buscar los productos en INITIAL_PRODUCTS
      const tostitos = INITIAL_PRODUCTS.find(
        (p) => p.id === "papitas-tostitos",
      );
      const fritos = INITIAL_PRODUCTS.find(
        (p) => p.id === "papitas-fritos",
      );

      // Agregar los que falten
      if (!hasTostitos && tostitos) {
        loadedProducts.push(tostitos);
      }
      if (!hasFritos && fritos) {
        loadedProducts.push(fritos);
      }

      // Guardar en ambos lados
      await syncProductsToSupabase(
        loadedProducts,
        currentBranch,
      );
      localStorage.setItem(
        STORAGE_KEY_PRODUCTS,
        JSON.stringify(loadedProducts),
      );

      const addedProducts = [];
      if (!hasTostitos) addedProducts.push("Tostitos");
      if (!hasFritos) addedProducts.push("Fritos");

      toast.success(
        `Nuevos productos agregados: ${addedProducts.join(" y ")}`,
        {
          icon: "🎉",
          duration: 4000,
        },
      );
    }

    setProducts(loadedProducts);
    localStorage.setItem(
      STORAGE_KEY_PRODUCTS,
      JSON.stringify(loadedProducts),
    );
    if (!supabaseProducts) {
      await syncProductsToSupabase(
        loadedProducts,
        currentBranch,
      );
    }

    // Grupos de stock
    if (supabaseStockGroups) {
      setStockGroups(supabaseStockGroups);
      localStorage.setItem(
        STORAGE_KEY_STOCK_GROUPS,
        JSON.stringify(supabaseStockGroups),
      );
    } else {
      const storedStockGroups = localStorage.getItem(
        STORAGE_KEY_STOCK_GROUPS,
      );
      if (storedStockGroups) {
        const localStockGroups = JSON.parse(storedStockGroups);
        setStockGroups(localStockGroups);
        await syncStockGroupsToSupabase(
          localStockGroups,
          currentBranch,
        );
      } else {
        setStockGroups(INITIAL_STOCK_GROUPS);
        localStorage.setItem(
          STORAGE_KEY_STOCK_GROUPS,
          JSON.stringify(INITIAL_STOCK_GROUPS),
        );
        await syncStockGroupsToSupabase(
          INITIAL_STOCK_GROUPS,
          currentBranch,
        );
      }
    }

    // Ventas
    if (supabaseSales) {
      setSales(supabaseSales);
      localStorage.setItem(
        STORAGE_KEY_SALES,
        JSON.stringify(supabaseSales),
      );
    } else {
      const storedSales = localStorage.getItem(
        STORAGE_KEY_SALES,
      );
      if (storedSales) {
        setSales(JSON.parse(storedSales));
      }
    }

    // Turnos
    if (supabaseShifts) {
      setShifts(supabaseShifts);
      localStorage.setItem(
        STORAGE_KEY_SHIFTS,
        JSON.stringify(supabaseShifts),
      );
    } else {
      const storedShifts = localStorage.getItem(
        STORAGE_KEY_SHIFTS,
      );
      if (storedShifts) {
        setShifts(JSON.parse(storedShifts));
      }
    }

    // Estado de cafetería
    if (supabaseCafeteriaState) {
      setCafeteriaState(supabaseCafeteriaState);
      localStorage.setItem(
        STORAGE_KEY_CAFETERIA_STATE,
        JSON.stringify(supabaseCafeteriaState),
      );
    } else {
      const storedCafeteriaState = localStorage.getItem(
        STORAGE_KEY_CAFETERIA_STATE,
      );
      if (storedCafeteriaState) {
        const localState = JSON.parse(storedCafeteriaState);
        setCafeteriaState(localState);
        await syncCafeteriaStateToSupabase(localState);
      }
    }

    // URL del video
    if (supabaseVideoUrl) {
      setScreensaverVideoUrl(supabaseVideoUrl);
      localStorage.setItem(
        STORAGE_KEY_SCREENSAVER_VIDEO,
        supabaseVideoUrl,
      );
    } else {
      const storedScreensaverVideoUrl = localStorage.getItem(
        STORAGE_KEY_SCREENSAVER_VIDEO,
      );
      if (storedScreensaverVideoUrl) {
        setScreensaverVideoUrl(storedScreensaverVideoUrl);
      }
    }

    // Actualizaciones de servicio
    if (supabaseServiceUpgrades) {
      setServiceUpgrades(supabaseServiceUpgrades);
      localStorage.setItem(
        STORAGE_KEY_SERVICE_UPGRADES,
        JSON.stringify(supabaseServiceUpgrades),
      );
    } else {
      const storedServiceUpgrades = localStorage.getItem(
        STORAGE_KEY_SERVICE_UPGRADES,
      );
      if (storedServiceUpgrades) {
        const localServiceUpgrades = JSON.parse(
          storedServiceUpgrades,
        );
        setServiceUpgrades(localServiceUpgrades);
        await syncServiceUpgradesToSupabase(
          localServiceUpgrades,
        );
      }
    }

    // Configuraciones de sucursal
    if (supabaseBranchConfigs) {
      setBranchConfigs(supabaseBranchConfigs);
      localStorage.setItem(
        STORAGE_KEY_BRANCH_CONFIGS,
        JSON.stringify(supabaseBranchConfigs),
      );
    } else {
      const storedBranchConfigs = localStorage.getItem(
        STORAGE_KEY_BRANCH_CONFIGS,
      );
      if (storedBranchConfigs) {
        const localBranchConfigs = JSON.parse(
          storedBranchConfigs,
        );
        setBranchConfigs(localBranchConfigs);
        await syncConfigValueToSupabase(
          "branch_configs",
          localBranchConfigs,
        );
      }
    }

    setIsLoadingFromSupabase(false);
  };

  const saveProducts = async (newProducts: Product[]) => {
    setProducts(newProducts);
    localStorage.setItem(
      STORAGE_KEY_PRODUCTS,
      JSON.stringify(newProducts),
    );
    try {
      await syncProductsToSupabase(newProducts, currentBranch);
      console.log("✅ Inventario guardado en la nube");
    } catch (error) {
      console.error("❌ Error al guardar inventario:", error);
      toast.error(
        "Error al guardar en la nube. Los cambios están solo en este dispositivo.",
      );
    }
  };

  const saveStockGroups = async (
    newStockGroups: StockGroup[],
  ) => {
    setStockGroups(newStockGroups);
    localStorage.setItem(
      STORAGE_KEY_STOCK_GROUPS,
      JSON.stringify(newStockGroups),
    );
    try {
      await syncStockGroupsToSupabase(
        newStockGroups,
        currentBranch,
      );
      console.log("✅ Grupos de stock guardados en la nube");
    } catch (error) {
      console.error(
        "❌ Error al guardar grupos de stock:",
        error,
      );
      toast.error(
        "Error al guardar en la nube. Los cambios están solo en este dispositivo.",
      );
    }
  };

  const saveSales = async (newSales: DailySale[]) => {
    setSales(newSales);
    localStorage.setItem(
      STORAGE_KEY_SALES,
      JSON.stringify(newSales),
    );
    // Solo sincronizar la última venta (la nueva)
    if (newSales.length > 0) {
      const latestSale = newSales[newSales.length - 1];
      await syncSaleToSupabase(latestSale);
    }
  };

  const saveShifts = async (newShifts: ShiftRecord[]) => {
    setShifts(newShifts);
    localStorage.setItem(
      STORAGE_KEY_SHIFTS,
      JSON.stringify(newShifts),
    );
    // Solo sincronizar el último turno (el nuevo)
    if (newShifts.length > 0) {
      const latestShift = newShifts[newShifts.length - 1];
      await syncShiftToSupabase(latestShift);
    }
  };

  const saveCafeteriaState = async (
    newState: CafeteriaState,
  ) => {
    setCafeteriaState(newState);
    localStorage.setItem(
      STORAGE_KEY_CAFETERIA_STATE,
      JSON.stringify(newState),
    );
    await syncCafeteriaStateToSupabase(newState, currentBranch);
  };

  const saveScreensaverVideoUrl = async (url: string) => {
    setScreensaverVideoUrl(url);
    localStorage.setItem(STORAGE_KEY_SCREENSAVER_VIDEO, url);
    await syncConfigValueToSupabase(
      "screensaver_video_url",
      url,
      currentBranch,
    );
  };

  const saveServiceUpgrades = async (
    newUpgrades: ServiceUpgrade[],
  ) => {
    setServiceUpgrades(newUpgrades);
    localStorage.setItem(
      STORAGE_KEY_SERVICE_UPGRADES,
      JSON.stringify(newUpgrades),
    );
    await syncServiceUpgradesToSupabase(
      newUpgrades,
      currentBranch,
    );
  };

  const saveBranchConfigs = async (
    newConfigs: Record<BranchName, BranchProductConfig>,
  ) => {
    setBranchConfigs(newConfigs);
    localStorage.setItem(
      STORAGE_KEY_BRANCH_CONFIGS,
      JSON.stringify(newConfigs),
    );
    await syncConfigValueToSupabase(
      "branch_configs",
      newConfigs,
    );
    toast.success("Configuración de sucursales guardada", {
      icon: "✅",
      duration: 2000,
    });
  };

  const handleSaveBranches = async (newBranches: Branch[]) => {
    setBranches(newBranches);
    // Actualizar BRANCHES global
    BRANCHES.splice(0, BRANCHES.length, ...newBranches);
    await syncConfigValueToSupabase("branches", newBranches);
    toast.success("Sucursales actualizadas", {
      icon: "🏢",
      duration: 2000,
    });
  };

  const handleSale = (
    items: SaleItem[],
    paymentMethod: PaymentMethod,
  ) => {
    // Verificar si hay suficientes tazas para capuchinos
    const capuchinosCount = items.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.productId);
      if (product && product.category === 'capuchinos') {
        return sum + item.quantity;
      }
      return sum;
    }, 0);

    const currentCups = cafeteriaState.currentCups ?? cafeteriaState.initialCups ?? 0;

    if (capuchinosCount > 0 && currentCups < capuchinosCount) {
      toast.error(`No hay suficientes vasos. Necesitas ${capuchinosCount} pero solo hay ${currentCups} disponibles.`, {
        duration: 5000,
        icon: '❌',
      });
      return;
    }

    // Actualizar inventario de productos individuales y grupos
    const newProducts = [...products];
    const newStockGroups = [...stockGroups];

    items.forEach((soldItem) => {
      const product = products.find(
        (p) => p.id === soldItem.productId,
      );
      if (!product) return;

      // Si el producto pertenece a un grupo de stock
      if (product.stockGroupId) {
        const groupIndex = newStockGroups.findIndex(
          (g) => g.id === product.stockGroupId,
        );
        if (groupIndex !== -1) {
          newStockGroups[groupIndex] = {
            ...newStockGroups[groupIndex],
            stock:
              newStockGroups[groupIndex].stock -
              soldItem.quantity,
          };
        }
      } else {
        // Si es producto individual
        const productIndex = newProducts.findIndex(
          (p) => p.id === soldItem.productId,
        );
        if (productIndex !== -1) {
          newProducts[productIndex] = {
            ...newProducts[productIndex],
            stock:
              newProducts[productIndex].stock -
              soldItem.quantity,
          };
        }
      }

      // Si es Maruchan (pero NO galletas-saladitas), también descontar tenedor y galletas saladitas
      if (
        product.category === "maruchan" &&
        product.id !== "galletas-saladitas"
      ) {
        const tenedorIndex = newProducts.findIndex(
          (p) => p.id === "tenedores",
        );
        if (tenedorIndex !== -1) {
          newProducts[tenedorIndex] = {
            ...newProducts[tenedorIndex],
            stock:
              newProducts[tenedorIndex].stock -
              soldItem.quantity,
          };
        }

        const galletasIndex = newProducts.findIndex(
          (p) => p.id === "galletas-saladitas",
        );
        if (galletasIndex !== -1) {
          newProducts[galletasIndex] = {
            ...newProducts[galletasIndex],
            stock:
              newProducts[galletasIndex].stock -
              soldItem.quantity,
          };
        }
      }
    });

    saveProducts(newProducts);
    saveStockGroups(newStockGroups);

    // Actualizar el estado de tazas si se vendió un capuchino
    if (capuchinosCount > 0) {
      saveCafeteriaState({
        ...cafeteriaState,
        currentCups: currentCups - capuchinosCount,
      });
    }

    // Registrar venta con branchId y paymentMethod
    const newSale: DailySale = {
      id: `sale-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      items,
      total: items.reduce((sum, item) => sum + item.total, 0),
      timestamp: Date.now(),
      paymentMethod, // Nuevo campo
      branchId: currentBranch,
    };
    saveSales([...sales, newSale]);
  };

  const handleUpdateInventory = (
    productId: string,
    newStock: number,
  ) => {
    const newProducts = products.map((product) =>
      product.id === productId
        ? { ...product, stock: newStock }
        : product,
    );
    saveProducts(newProducts);
  };

  const handleUpdateProduct = (
    productId: string,
    updates: Partial<Product>,
  ) => {
    const newProducts = products.map((product) =>
      product.id === productId
        ? { ...product, ...updates }
        : product,
    );
    saveProducts(newProducts);
  };

  const handleCreateProduct = (
    product: Omit<Product, "id">,
  ) => {
    const newProduct: Product = {
      ...product,
      id: `product-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    saveProducts([...products, newProduct]);
  };

  const handleDeleteProduct = (productId: string) => {
    const newProducts = products.filter(
      (p) => p.id !== productId,
    );
    saveProducts(newProducts);
  };

  const handleUpdateStockGroup = (
    groupId: string,
    newStock: number,
  ) => {
    const newStockGroups = stockGroups.map((group) =>
      group.id === groupId
        ? { ...group, stock: newStock }
        : group,
    );
    saveStockGroups(newStockGroups);
  };

  const handleRestock = (productId: string) => {
    const newProducts = products.map((product) =>
      product.id === productId
        ? {
            ...product,
            stock: product.stock + product.reorderQuantity,
          }
        : product,
    );
    saveProducts(newProducts);
  };

  const handleRestockGroup = (groupId: string) => {
    const newStockGroups = stockGroups.map((group) =>
      group.id === groupId
        ? {
            ...group,
            stock: group.stock + group.reorderQuantity,
          }
        : group,
    );
    saveStockGroups(newStockGroups);
  };

  const handleOpenCafeteria = () => {
    setShowOpenConfirmation(true);
  };

  const confirmOpenCafeteria = (initialChange: number, initialCups: number) => {
    const now = Date.now();
    saveCafeteriaState({
      isOpen: true,
      openedAt: now,
      currentShiftStartTime: now,
      initialStock: {
        products: JSON.parse(JSON.stringify(products)),
        stockGroups: JSON.parse(JSON.stringify(stockGroups)),
      },
      initialMoney: initialChange,
      initialCups: initialCups,
      currentCups: initialCups,
    });
    setShowOpenConfirmation(false);
    toast.success(`¡Cafetería abierta! Turno iniciado con ${initialCups} vasos.`, {
      duration: 3000,
      icon: "☕",
    });
  };

  const handleCloseCafeteria = (changeMoney: number = 0) => {
    // Desactivar todas las mejoras de servicio al cerrar
    const deactivatedUpgrades = serviceUpgrades.map(upgrade => ({
      ...upgrade,
      isActive: false,
    }));
    
    saveServiceUpgrades(deactivatedUpgrades);
    
    saveCafeteriaState({
      isOpen: false,
      initialMoney: changeMoney,
    });
    
    toast.info("Cafetería cerrada. Corte completado. Las mejoras de servicio se han desactivado.", {
      duration: 4000,
      icon: "🔒",
    });
  };

  const handleLogin = () => {
    setView("admin");
  };

  const handleLogout = () => {
    setView("sales");
  };

  const openAdminLogin = () => {
    setView("login");
  };

  const handleCreateServiceUpgrade = (
    chapel: ChapelName,
    totalCoffees: number,
    totalCost: number,
  ) => {
    const newUpgrade: ServiceUpgrade = {
      id: `upgrade-${Date.now()}`,
      chapel,
      totalCoffees,
      remainingCoffees: totalCoffees,
      totalCost,
      timestamp: Date.now(),
      isActive: true,
    };

    const newUpgrades = [...serviceUpgrades, newUpgrade];
    saveServiceUpgrades(newUpgrades);
    toast.success(`Mejora creada para Capilla ${chapel}`, {
      icon: "☕",
      duration: 3000,
    });
  };

  const handleRedeemCoffee = (
    upgradeId: string,
    quantity: number = 1,
  ) => {
    const newUpgrades = serviceUpgrades.map((upgrade) => {
      if (upgrade.id === upgradeId) {
        const newRemainingCoffees =
          upgrade.remainingCoffees - quantity;
        return {
          ...upgrade,
          remainingCoffees: newRemainingCoffees,
          isActive: newRemainingCoffees > 0,
        };
      }
      return upgrade;
    });

    saveServiceUpgrades(newUpgrades);
    
    // Descontar vasos del inventario (cada café redimido usa un vaso)
    const currentCups = cafeteriaState.currentCups ?? cafeteriaState.initialCups ?? 0;
    const newCupsCount = Math.max(0, currentCups - quantity);
    
    const newState: CafeteriaState = {
      ...cafeteriaState,
      currentCups: newCupsCount,
    };
    
    saveCafeteriaState(newState);
    
    toast.success(`${quantity} café${quantity > 1 ? 's' : ''} redimido${quantity > 1 ? 's' : ''} (-${quantity} vaso${quantity > 1 ? 's' : ''})`, {
      icon: "☕",
      duration: 3000,
    });
  };

  const handleUpdateCups = (newCount: number) => {
    saveCafeteriaState({
      ...cafeteriaState,
      currentCups: newCount,
    });
    toast.success(`Vasos actualizados: ${newCount}`, {
      icon: '🥤',
      duration: 2000,
    });
  };

  const handleChangeBranch = async (newBranch: BranchName) => {
    if (newBranch === currentBranch) return;

    setIsLoadingFromSupabase(true);
    setCurrentBranch(newBranch);
    localStorage.setItem(STORAGE_KEY_CURRENT_BRANCH, newBranch);

    toast.info(
      `Cambiando a sucursal ${newBranch.toUpperCase()}...`,
      {
        icon: "🏢",
        duration: 2000,
      },
    );

    // Cargar datos de la nueva sucursal
    const supabaseProducts =
      await loadProductsFromSupabase(newBranch);
    const supabaseStockGroups =
      await loadStockGroupsFromSupabase(newBranch);
    const supabaseSales =
      await loadSalesFromSupabase(newBranch);
    const supabaseShifts =
      await loadShiftsFromSupabase(newBranch);
    const supabaseCafeteriaState =
      await loadCafeteriaStateFromSupabase(newBranch);
    const supabaseVideoUrl = await loadConfigValueFromSupabase(
      "screensaver_video_url",
      newBranch,
    );
    const supabaseServiceUpgrades =
      await loadServiceUpgradesFromSupabase(newBranch);
    const supabaseBranchConfigs =
      await loadConfigValueFromSupabase(
        "branch_configs",
        newBranch,
      );

    // Si no hay datos en Supabase, crear datos iniciales
    setProducts(
      supabaseProducts ||
        INITIAL_PRODUCTS.map((p) => ({
          ...p,
          branchId: newBranch,
          isEnabled: true,
        })),
    );
    setStockGroups(
      supabaseStockGroups ||
        INITIAL_STOCK_GROUPS.map((g) => ({
          ...g,
          branchId: newBranch,
        })),
    );
    setSales(supabaseSales || []);
    setShifts(supabaseShifts || []);
    setCafeteriaState(
      supabaseCafeteriaState || {
        isOpen: false,
        initialMoney: 0,
        branchId: newBranch,
      },
    );
    setScreensaverVideoUrl(supabaseVideoUrl);
    setServiceUpgrades(supabaseServiceUpgrades || []);
    setBranchConfigs(
      supabaseBranchConfigs || {
        zapopan: {
          branchId: "zapopan",
          disabledCategories: [],
          disabledProducts: [],
        },
        vallarta: {
          branchId: "vallarta",
          disabledCategories: ["capuchinos"],
          disabledProducts: [],
        },
        oblatos: {
          branchId: "oblatos",
          disabledCategories: ["capuchinos"],
          disabledProducts: [],
        },
      },
    );

    setIsLoadingFromSupabase(false);

    toast.success(
      `Sucursal ${newBranch.toUpperCase()} cargada`,
      {
        icon: "✅",
        duration: 2000,
      },
    );
  };

  if (isLoadingFromSupabase) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
        <div className="text-center">
          <div className="text-6xl mb-4">☕</div>
          <div className="text-xl font-semibold text-amber-900">
            Cargando sistema...
          </div>
          <div className="text-sm text-amber-700 mt-2">
            Sincronizando con Supabase
          </div>
        </div>
      </div>
    );
  }

  if (view === "login") {
    return (
      <LoginScreen
        onLogin={handleLogin}
        onCancel={() => setView("sales")}
      />
    );
  }

  if (view === "admin") {
    return (
      <AdminPanel
        products={products}
        stockGroups={stockGroups}
        sales={sales}
        shifts={shifts}
        onUpdateInventory={handleUpdateInventory}
        onUpdateStockGroup={handleUpdateStockGroup}
        onRestock={handleRestock}
        onRestockGroup={handleRestockGroup}
        onUpdateProduct={handleUpdateProduct}
        onCreateProduct={handleCreateProduct}
        onDeleteProduct={handleDeleteProduct}
        onUpdateScreensaverVideo={saveScreensaverVideoUrl}
        screensaverVideoUrl={screensaverVideoUrl}
        onLogout={handleLogout}
        serviceUpgrades={serviceUpgrades}
        onCreateServiceUpgrade={handleCreateServiceUpgrade}
        onRedeemCoffee={handleRedeemCoffee}
        currentBranch={currentBranch}
        onChangeBranch={handleChangeBranch}
        branchConfigs={branchConfigs}
        onUpdateBranchConfigs={saveBranchConfigs}
        branches={branches}
        onSaveBranches={handleSaveBranches}
      />
    );
  }

  return (
    <>
      <SalesScreen
        products={products}
        stockGroups={stockGroups}
        sales={sales}
        shifts={shifts}
        cafeteriaState={cafeteriaState}
        onSale={handleSale}
        onOpenSettings={openAdminLogin}
        onOpenCafeteria={handleOpenCafeteria}
        onCloseCafeteria={handleCloseCafeteria}
        onSaveShift={saveShifts}
        screensaverVideoUrl={screensaverVideoUrl}
        serviceUpgrades={serviceUpgrades}
        onCreateServiceUpgrade={handleCreateServiceUpgrade}
        onRedeemCoffee={handleRedeemCoffee}
        onUpdateCups={handleUpdateCups}
        currentBranch={currentBranch}
        branchConfig={branchConfigs[currentBranch]}
      />
      <Toaster />
      {showOpenConfirmation && (
        <OpenCafeteriaConfirmation
          products={products}
          stockGroups={stockGroups}
          onCancel={() => setShowOpenConfirmation(false)}
          onConfirm={confirmOpenCafeteria}
          onUpdateInventory={(
            updatedProducts,
            updatedStockGroups,
          ) => {
            // Actualizar productos y grupos de stock con los valores corregidos
            setProducts(updatedProducts);
            setStockGroups(updatedStockGroups);

            // Sincronizar con Supabase
            syncProductsToSupabase(updatedProducts);
            syncStockGroupsToSupabase(updatedStockGroups);
          }}
        />
      )}
    </>
  );
}

export default App;