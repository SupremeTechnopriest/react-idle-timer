import { useRef, useState, BaseSyntheticEvent } from 'react'
import { IIdleTimer, IIdleTimerProps } from 'react-idle-timer'
import {
  Drawer,
  DrawerHeader,
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Tabs,
  Tab,
  TabList,
  TabPanels,
  TabPanel,
  Flex,
  Spacer,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Text,
  Button,
  IconButton,
  Switch,
  Input,
  InputGroup,
  InputRightElement,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useDisclosure
} from '@chakra-ui/react'
import { AiOutlineMenu } from 'react-icons/ai'
import { debounceFn } from '@utils/debounce'

interface ISwitchWithLabelProps {
  label: string
  defaultChecked?: boolean
  onChange?: (checked: boolean) => void
}

function SwitchWithLabel (props: ISwitchWithLabelProps) {
  return (
    <FormControl
      display='flex'
      alignItems='center'
      justifyContent='space-between'
      role='group'
      cursor='pointer'

      onChange={(e: BaseSyntheticEvent) => {
        const checked = e.target.checked
        if (props.onChange) props.onChange(checked)
      }}
    >
      <FormLabel
        htmlFor={props.label}
        mb='0'
        mr={3}
        cursor='pointer'
        _groupHover={{
          color: 'red.400'
        }}
      >
        {props.label}
      </FormLabel>
      <Switch
        id={props.label}
        defaultChecked={props.defaultChecked}
        colorScheme='red'
      />
    </FormControl>
  )
}

interface INumberInputWithLabelProps {
  label: string
  defaultValue: number
  onChange: (value: number) => void
}

function NumberInputWithLabel (props: INumberInputWithLabelProps) {
  const { label, defaultValue, onChange } = props
  const onChangeHandler = debounceFn((value: number) => {
    onChange(value)
  }, 500)

  return (
    <Flex
      w='full'
      justify='space-between'
      align='center'
      role='group'
    >
      <Text _groupHover={{ color: 'red.400' }}>{label}</Text>
      <NumberInput
        w={125}
        defaultValue={defaultValue}
        focusBorderColor='red.400'
        onChange={onChangeHandler}
      >
        <NumberInputField />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput>
    </Flex>
  )
}

interface IMessageInputProps {
  label: string
  onClick: (message: string) => void
}

function MessageInput (props: IMessageInputProps) {
  const [message, setMessage] = useState<string>('Hello')

  const onClick = () => {
    if (message) {
      props.onClick(message)
    }
  }

  return (
    <InputGroup size='md'>
      <Input
        pr='4.5rem'
        type='text'
        defaultValue={message}
        placeholder='Message Content'
        onChange={event => setMessage(event.target.value)}
      />
      <InputRightElement width='6rem'>
        <Button
          h='1.75rem'
          size='sm'
          _hover={{
            bg: 'red.400',
            color: 'white'
          }}
          onClick={onClick}
        >
          message
        </Button>
      </InputRightElement>
    </InputGroup>
  )
}

interface IButtonWithLabelProps {
  label: string
  onClick: () => void
}

function ButtonWithLabel (props: IButtonWithLabelProps) {
  return (
    <Button
      w='full'
      _hover={{
        bg: 'red.400',
        color: 'white'
      }}
      onClick={(event: BaseSyntheticEvent) => {
        event.stopPropagation()
        props.onClick()
      }}>
        {props.label}
    </Button>
  )
}

type IdleTimerType = IIdleTimer & IIdleTimerProps

interface IControlDrawerProps extends IdleTimerType {
  setTimeout: (value: number) => void
  setPromptTimeout: (value: number) => void
  setThrottle: (value: number) => void
  setDebounce: (value: number) => void
  setEventsThrottle: (value: number) => void
  setStartOnMount: (value: boolean) => void
  setStartManually: (value: boolean) => void
  setStopOnIdle: (value: boolean) => void
  setCrossTab: (value: boolean) => void
  emitOnSelf: boolean
  setEmitOnSelf: (value: boolean) => void
  setSyncTimers: (value: number) => void
}

export function ControlDrawer (props: IControlDrawerProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const btnRef = useRef()

  return (
    <>
      <IconButton
        icon={<AiOutlineMenu />}
        aria-label='Open Controls'
        ref={btnRef}
        onClick={onOpen}
        position='absolute'
        zIndex={1}
        top='1em'
        left ='1em'
      />
      <Drawer
        size='sm'
        isOpen={isOpen}
        placement='left'
        onClose={onClose}
        finalFocusRef={btnRef}
        closeOnOverlayClick={false}
      >
        <DrawerOverlay bg='blackAlpha.400' />
        <DrawerContent bgColor='gray.800'>
          <DrawerHeader mb={4}>
            <DrawerCloseButton />
          </DrawerHeader>
          <DrawerBody>
            <Tabs isFitted variant='enclosed' colorScheme='red'>
              <TabList mb='1em'>
                <Tab>Props</Tab>
                <Tab>Methods</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <VStack>
                    <NumberInputWithLabel label='timeout' defaultValue={props.timeout} onChange={props.setTimeout} />
                    <NumberInputWithLabel label='promptTimeout' defaultValue={props.promptTimeout} onChange={props.setPromptTimeout} />
                    <NumberInputWithLabel label='debounce' defaultValue={props.debounce} onChange={props.setDebounce} />
                    <NumberInputWithLabel label='throttle' defaultValue={props.throttle} onChange={props.setThrottle} />
                    <NumberInputWithLabel label='eventsThrottle' defaultValue={props.eventsThrottle} onChange={props.setEventsThrottle} />
                    <Spacer />
                    <SwitchWithLabel label='startOnMount' defaultChecked={props.startOnMount} onChange={props.setStartOnMount} />
                    <SwitchWithLabel label='startManually' defaultChecked={props.startManually} onChange={props.setStartManually} />
                    <SwitchWithLabel label='stopOnIdle' defaultChecked={props.stopOnIdle} onChange={props.setStopOnIdle} />
                    <SwitchWithLabel label='crossTab' defaultChecked={props.crossTab} onChange={props.setCrossTab} />
                    {props.crossTab && (
                      <>
                        <NumberInputWithLabel label='syncTimers' defaultValue={props.syncTimers} onChange={props.setSyncTimers} />
                      </>
                    )}
                  </VStack>
                </TabPanel>
                <TabPanel>
                  <VStack>
                    <HStack width='full'>
                      <VStack width='40%'>
                        <ButtonWithLabel label='start' onClick={() => props.start()} />
                        <ButtonWithLabel label='reset' onClick={() => props.reset()} />
                        <ButtonWithLabel label='pause' onClick={() => props.pause()} />
                        <ButtonWithLabel label='resume' onClick={() => props.resume()} />
                        <ButtonWithLabel label='isIdle' onClick={() => props.isIdle()} />
                        <ButtonWithLabel label='isPrompted' onClick={() => props.isPrompted()} />
                        <Button disabled w='full'></Button>
                      </VStack>
                      <VStack width='60%'>
                        <ButtonWithLabel label='getRemainingTime' onClick={() => props.getRemainingTime()} />
                        <ButtonWithLabel label='getElapsedTime' onClick={() => props.getElapsedTime()} />
                        <ButtonWithLabel label='getTotalElapsedTime' onClick={() => props.getTotalElapsedTime()} />
                        <ButtonWithLabel label='getLastActiveTime' onClick={() => props.getLastActiveTime()} />
                        <ButtonWithLabel label='getLastIdleTime' onClick={() => props.getLastIdleTime()} />
                        <ButtonWithLabel label='getTotalActiveTime' onClick={() => props.getTotalActiveTime()} />
                        <ButtonWithLabel label='getTotalIdleTime' onClick={() => props.getTotalIdleTime()} />
                      </VStack>
                    </HStack>
                    <MessageInput label='message' onClick={props.message} />
                    <SwitchWithLabel label='emitOnSelf' defaultChecked={props.emitOnSelf} onChange={props.setEmitOnSelf}/>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
}
